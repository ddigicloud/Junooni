"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft, Save, Loader2, GripVertical, Plus, Trash2,
  ChevronUp, ChevronDown, X, Monitor, Smartphone, RefreshCw,
  ExternalLink, Layout, Palette, FileText, Layers,
  Eye, EyeOff, Settings, Globe, Image as ImageIcon,
  Type, Star, Megaphone, Minus, Share2, ShoppingBag,
  BookOpen, Upload, Check, ChevronRight, ChevronDown as ChevronDownIcon,
  Pencil, Copy, Instagram, Youtube, Twitter, Facebook,
  Video, Link as LinkIcon, Grid, AlignLeft, AlignCenter,
  Radio, Zap, Moon, Sun, MoreVertical, Columns, Menu, Search, PanelLeftClose
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStoreUrl, getPreviewUrl, getPageUrl } from "@/lib/store-urls"

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = "header" | "hero" | "featured" | "collection" | "featured_collections" | "about" | "social" |
  "announcement" | "divider" | "image" | "text" | "html" | "video" | "links" | "footer" | "category_grid" | "category_products"
  "ticker" | "image_text" | "video_text" | "featured_product" | "category_grid" | "collections_grid"

type EditorTab = "layout" | "style" | "pages" | "theme"

type PageTemplate = "blank" | "about" | "faq" | "contact" | "links" | "terms" | "privacy" | "returns"

interface NavItem { id: string; label: string; url: string; external?: boolean; children?: NavItem[] }

interface FooterColumn {
  id: string
  heading: string
  items: NavItem[]
}

interface ProductDetailSettings {
  // Layout order — drag to reorder
  element_order?: Array<"title" | "price" | "colors" | "sizes" | "quantity" | "atc" | "description" | "meta">
  // Title
  title_size?: "sm" | "md" | "lg" | "xl"
  title_weight?: "normal" | "semibold" | "bold" | "extrabold"
  title_color?: string
  // Price
  price_color?: string
  price_size?: "sm" | "md" | "lg" | "xl"
  // Colors label
  colors_label?: string
  show_color_label?: boolean
  color_swatch_size?: "sm" | "md" | "lg"
  // Sizes
  sizes_label?: string
  show_size_label?: boolean
  size_style?: "pill" | "box" | "underline"
  // ATC button
  atc_label?: string
  atc_style?: "filled" | "outline" | "pill"
  atc_full_width?: boolean
  // Quantity
  show_quantity?: boolean
  // Description
  show_description?: boolean
  description_collapsed?: boolean
  // Meta
  show_secure_badge?: boolean
  secure_badge_text?: string
}

interface StoreSection {
  id: string; type: SectionType; hidden?: boolean
  title?: string; headline?: string; subtext?: string
  cta_label?: string; cta_url?: string; cta_secondary_label?: string; cta_secondary_url?: string
  overlay_color?: string; overlay_text_color?: string
  background_image?: string; background_color?: string; text_color?: string
  text?: string; image?: string; image_position?: "left" | "right"
  product_ids?: string[]; collection_ids?: string[]; limit?: number; columns?: 2 | 3 | 4; show_sold_out?: boolean
  show_instagram?: boolean; show_youtube?: boolean; show_twitter?: boolean; show_facebook?: boolean
  show_product_count?: boolean
  html_content?: string; video_url?: string; video_autoplay?: boolean
  links?: { id: string; label: string; url: string; icon?: string }[]
  logo_position?: "left" | "center"; show_social_icons?: boolean; nav_items?: NavItem[]
  footer_nav_items?: NavItem[]; show_newsletter?: boolean
  footer_columns?: FooterColumn[]
  footer_columns_per_row?: number
  footer_columns_per_row_mobile?: number
  logo_size_desktop?: number
  logo_size_mobile?: number
  footer_logo_size_desktop?: number
  footer_logo_size_mobile?: number
  // ticker
  ticker_items?: string[]; ticker_speed?: number; ticker_separator?: string
  // image_text / video_text
  video_text_url?: string
  mobile_image_position?: "top" | "bottom"
  // featured_product
  featured_product_id?: string
  featured_product_heading?: string
  featured_product_show_title?: boolean
  featured_product_show_price?: boolean
  featured_product_show_colors?: boolean
}

interface StorePage {
  id: string; title: string; slug: string; template: PageTemplate
  content: string; in_nav: boolean; in_footer: boolean; created_at: string
}

interface ProductCardSettings {
  aspect_ratio?: "square" | "portrait" | "landscape"
  show_price?: boolean; show_hover?: boolean; alignment?: "left" | "center"
  show_sold_out_badge?: boolean; columns_desktop?: 3 | 4 | 5
}

interface VendorStore {
  id?: string; subdomain?: string; custom_domain?: string; domain_verified?: boolean
  template?: string; status?: string; font?: string
  primary_color?: string; secondary_color?: string; accent_color?: string
  background_color?: string; text_color?: string; hero_image?: string
  tagline?: string; announcement_text?: string
  store_logo?: string; store_favicon?: string
  sections?: {
    sections: StoreSection[]                                    // home page
    page_layouts?: Partial<Record<string, { sections: StoreSection[] }>>
  }
  pages?: { pages: StorePage[] }
  seo_title?: string; seo_description?: string; og_image?: string
  border_radius?: "none" | "sm" | "md" | "lg" | "full"
  button_style?: "filled" | "outline" | "ghost"
  product_card?: ProductCardSettings
  sticky_header?: boolean; sticky_announcement?: boolean
  instagram_url?: string; youtube_url?: string; twitter_url?: string
  facebook_url?: string; tiktok_url?: string; discord_url?: string
  product_detail?: ProductDetailSettings
  custom_css?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

let _linkInputProducts: { id: string; title: string; handle: string; thumbnail?: string }[] = []
let _linkInputProductsRef: { current: { id: string; title: string; handle: string; thumbnail?: string }[] } = { current: [] }

// Add this constant near SECTION_BLOCKS:
const PAGE_ALLOWED_SECTIONS: Record<string, SectionType[]> = {
  home: [
    "hero", "ticker", "collection", "featured",
    "featured_collections", "featured_product", "about", "text",
    "image", "image_text", "video", "video_text", "social", "links",
    "html", "divider"
  ],
  products: [
    "hero", "ticker", "text", "image", "image_text",
    "video", "video_text", "html", "divider", "collection"
  ],
  collections: [
    "hero", "ticker", "text", "image", "html", "divider",
    "featured_collections"
  ],
  collection: [
    "hero", "ticker", "text", "image", "html", "divider", "collection"
  ],
  categories: [ "hero", "ticker", "text", "image", "image_text", "video", "html", "divider", "category_grid",
  ],
  category: [ "hero", "ticker", "text", "image", "image_text", "video", "html", "divider", "collection",
  ],
  product: [
    // Only upsell/related sections make sense below product detail
    "featured", "text", "image", "image_text", "video",
    "video_text", "html", "divider", "ticker"
  ],
  cart: [
    "featured", "text", "html", "divider"
  ],
  search: [
    "text", "html", "divider"
  ],
}

const SECTION_BLOCKS = [
  { type: "announcement" as SectionType, label: "Announcement Bar", icon: <Megaphone className="w-3.5 h-3.5" />, desc: "Top banner with message", color: "#f59e0b", category: "layout" },
  { type: "hero"         as SectionType, label: "Hero Banner",      icon: <ImageIcon className="w-3.5 h-3.5" />, desc: "Big headline + CTA buttons", color: "#8b5cf6", category: "layout" },
  { type: "collection"   as SectionType, label: "Product Grid",     icon: <ShoppingBag className="w-3.5 h-3.5" />, desc: "All products / filtered grid", color: "#e65100", category: "products" },
  { type: "featured"     as SectionType, label: "Featured Products",icon: <Star className="w-3.5 h-3.5" />, desc: "Hand-picked highlights", color: "#ec4899", category: "products" },
  { type: "featured_collections" as SectionType, label: "Collections Showcase", icon: <Layers className="w-3.5 h-3.5" />, desc: "Pick collections to feature", color: "#7c3aed", category: "products" },
  { type: "about"        as SectionType, label: "About",            icon: <BookOpen className="w-3.5 h-3.5" />, desc: "Story + image block", color: "#10b981", category: "content" },
  { type: "text"         as SectionType, label: "Text Block",       icon: <Type className="w-3.5 h-3.5" />, desc: "Rich text / Markdown", color: "#14b8a6", category: "content" },
  { type: "image"        as SectionType, label: "Image",            icon: <ImageIcon className="w-3.5 h-3.5" />, desc: "Full-width image", color: "#6366f1", category: "content" },
  { type: "video"        as SectionType, label: "Video",            icon: <Video className="w-3.5 h-3.5" />, desc: "YouTube / Vimeo embed", color: "#f43f5e", category: "content" },
  { type: "social"       as SectionType, label: "Social Links",     icon: <Share2 className="w-3.5 h-3.5" />, desc: "Instagram, YouTube etc.", color: "#3b82f6", category: "content" },
  { type: "links"        as SectionType, label: "Link List",        icon: <LinkIcon className="w-3.5 h-3.5" />, desc: "Bio-style link buttons", color: "#0ea5e9", category: "content" },
  { type: "html"         as SectionType, label: "Custom HTML",      icon: <Settings className="w-3.5 h-3.5" />, desc: "Raw HTML / CSS / JS", color: "#ef4444", category: "advanced" },
  { type: "divider"          as SectionType, label: "Divider",            icon: <Minus className="w-3.5 h-3.5" />, desc: "Visual separator",                  color: "#9ca3af", category: "layout" },
  { type: "ticker"           as SectionType, label: "Scrolling Ticker",   icon: <Radio className="w-3.5 h-3.5" />, desc: "Marquee text banner",                color: "#f59e0b", category: "layout" },
  { type: "image_text"       as SectionType, label: "Image with Text",    icon: <Columns className="w-3.5 h-3.5" />, desc: "Image + rich text side by side",  color: "#8b5cf6", category: "content" },
  { type: "video_text"       as SectionType, label: "Video with Text",    icon: <Video className="w-3.5 h-3.5" />, desc: "Video + rich text side by side",    color: "#f43f5e", category: "content" },
  { type: "featured_product" as SectionType, label: "Featured Product",   icon: <Star className="w-3.5 h-3.5" />, desc: "Spotlight one product with text",   color: "#ec4899", category: "products" },
  { type: "category_products" as SectionType, label: "Category Products", icon: <Grid className="w-3.5 h-3.5" />, desc: "Products in this category", color: "#f59e0b", category: "layout" },
]

const PAGE_LAYOUT_META: Record<string, {
  label: string; icon: string; path: string
  defaultSections: Partial<StoreSection>[]
  isFixed?: boolean; systemNote?: string
}> = {
  home: {
    label: "Home", icon: "🏠", path: "/",
    defaultSections: [],
  },
  products: {
    label: "All Products", icon: "🛍️", path: "/products",
    defaultSections: [
      { id: "def_prod_grid", type: "collection" as SectionType, title: "All Products", limit: 48, columns: 3, show_sold_out: true },
    ],
  },
  // In PAGE_LAYOUT_META, categories entry already exists but update it:
  categories: {
    label: "Categories", icon: "🏷️", path: "/categories",
    defaultSections: [],
  },
  category: {
    label: "Category page", icon: "🏷️", path: "/categories/[handle]",
    defaultSections: [],
    systemNote: "Products in this category are always shown below your sections",
  },
  collections: {
    label: "Collections", icon: "📦", path: "/collections",
    defaultSections: [
      { id: "def_cols_grid", type: "featured_collections" as SectionType, title: "Shop by Collection", collection_ids: [], columns: 3 },
    ],
  },
  collection: {
    label: "Collection page", icon: "🗂️", path: "/collections/[handle]",
    defaultSections: [
      { id: "def_col_grid", type: "collection" as SectionType, title: "Products", limit: 24, columns: 3, show_sold_out: true },
    ],
    systemNote: "Applied to all individual collection pages",
  },
 // In PAGE_LAYOUT_META, update product entry:
  product: {
    label: "Product page", icon: "👕", path: "/products/[handle]",
    defaultSections: [
      { 
        id: "def_prod_upsell", 
        type: "featured" as SectionType, 
        title: "You might also like", 
        limit: 4, 
        columns: 4 
      },
    ],
    isFixed: true,
    systemNote: "Product images, variants & Add to Cart are always shown above your sections",
  },
  cart: {
    label: "Cart", icon: "🛒", path: "/cart",
    defaultSections: [
      { id: "def_cart_upsell", type: "featured" as SectionType, title: "Complete your look", limit: 4, columns: 4 },
    ],
    isFixed: true,
    systemNote: "Cart items and checkout button are always shown above your sections",
  },
  search: {
    label: "Search", icon: "🔍", path: "/search",
    defaultSections: [],
    isFixed: true,
    systemNote: "Search bar and results are always shown above your sections",
  },
}

const SECTION_CATEGORIES = [
  { id: "layout", label: "Layout" },
  { id: "products", label: "Products" },
  { id: "content", label: "Content" },
  { id: "advanced", label: "Advanced" },
]

const FONTS = [
  { id: "inter",         name: "Inter",            class: "font-sans" },
  { id: "poppins",       name: "Poppins",          class: "font-sans" },
  { id: "playfair",      name: "Playfair Display", class: "font-serif" },
  { id: "dm-sans",       name: "DM Sans",          class: "font-sans" },
  { id: "space-grotesk", name: "Space Grotesk",    class: "font-sans" },
  { id: "nunito",     name: "Nunito",     class: "font-sans" },
  { id: "raleway",    name: "Raleway",    class: "font-sans" },
  { id: "montserrat", name: "Montserrat", class: "font-sans" },
]

const TEMPLATES = [
  { id: "minimal",   name: "Minimal",   desc: "Clean, white" },
  { id: "bold",      name: "Bold",      desc: "Dark & dramatic" },
  { id: "editorial", name: "Editorial", desc: "Magazine style" },
]

const PAGE_TEMPLATES = [
  { id: "blank"   as PageTemplate, label: "Blank",    icon: "📄", defaultContent: "" },
  { id: "about"   as PageTemplate, label: "About Me", icon: "👋", defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq"     as PageTemplate, label: "FAQ",      icon: "❓", defaultContent: "## Frequently Asked Questions\n\n**Q: How long does shipping take?**\nA: 5-7 business days.\n\n**Q: Do you ship internationally?**\nA: Yes!" },
  { id: "contact" as PageTemplate, label: "Contact",  icon: "✉️", defaultContent: "## Contact Us\n\nReach out at your@email.com\n\nWe typically respond within 24 hours." },
  { id: "links"   as PageTemplate, label: "Links",    icon: "🔗", defaultContent: "" },
   { id: "terms" as PageTemplate, label: "Terms of Service", icon: "📋", defaultContent: `## Terms of Service

*Last updated: {{CREATED_DATE}}*

Welcome to **[Your Store Name]**. By accessing or purchasing from our store, you agree to the following terms.

### 1. General
These Terms of Service apply to all visitors, users, and customers of [Your Store Name] ("we", "us", or "our").

### 2. Products
All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.

### 3. Orders & Payment
By placing an order, you confirm that the information you provide is accurate. We accept payment via the methods listed at checkout. Orders are processed only after payment is confirmed.

### 4. Shipping
We ship pan-India. Estimated delivery is 5–10 business days. We are not responsible for delays caused by shipping carriers or customs.

### 5. Returns & Refunds
Please refer to our [Returns & Refunds Policy](/pages/returns-refunds) for details.

### 6. Intellectual Property
All content on this store — including logos, designs, and product images — is the property of [Your Store Name] and may not be reproduced without written permission.

### 7. Limitation of Liability
We shall not be liable for any indirect, incidental, or consequential damages arising from your use of our store or products.

### 8. Contact
For any questions, reach us at **[your@email.com]**` },

  { id: "privacy" as PageTemplate, label: "Privacy Policy", icon: "🔒", defaultContent: `## Privacy Policy

*Last updated: {{CREATED_DATE}}*

At **[Your Store Name]**, your privacy is important to us. This policy explains what data we collect and how we use it.

### 1. Information We Collect
- **Personal information:** Name, email address, shipping address, and phone number when you place an order.
- **Payment information:** We do not store card details. Payments are processed securely by our payment partner.
- **Usage data:** Pages visited, browser type, and device information for improving our store experience.

### 2. How We Use Your Information
- To process and fulfil your orders
- To send order confirmations and shipping updates
- To respond to customer service queries
- To improve our products and store experience

### 3. Data Sharing
We do not sell your personal information. We share data only with:
- **Shipping partners** to deliver your orders
- **Payment processors** to handle transactions securely
- **Analytics tools** to understand store performance (data is anonymised)

### 4. Cookies
Our store uses cookies to keep your cart, remember preferences, and analyse traffic. You can disable cookies in your browser settings, though this may affect store functionality.

### 5. Data Retention
We retain your order data for up to 3 years for accounting and legal compliance purposes.

### 6. Your Rights
You have the right to access, correct, or delete your personal data. To make a request, email us at **[your@email.com]**.

### 7. Contact
Questions about this policy? Write to us at **[your@email.com]**` },

  { id: "returns" as PageTemplate, label: "Returns & Refunds", icon: "↩️", defaultContent: `## Returns & Refunds Policy

*Last updated: {{CREATED_DATE}}*

We want you to love what you ordered. If something isn't right, here's how we handle it.

### Eligibility for Returns
- Items must be returned within **7 days** of delivery.
- Products must be unused, unwashed, and in original packaging with tags intact.
- The following are **not eligible** for return: sale items, digital products, and personalised/custom items.

### How to Initiate a Return
1. Email us at **[your@email.com]** with your order number and reason for return.
2. Our team will respond within 48 hours with return instructions.
3. Ship the item back to the address we provide. Return shipping costs are borne by the customer unless the item is defective.

### Refunds
- Once we receive and inspect the returned item, we will notify you of approval or rejection.
- Approved refunds are processed within **5–7 business days** to your original payment method.
- Shipping charges are non-refundable.

### Exchanges
We currently offer exchanges for size or colour issues, subject to availability. Please mention your preferred replacement when initiating a return.

### Damaged or Wrong Items
If you received a damaged, defective, or incorrect item, please email us at **[your@email.com]** within **48 hours of delivery** with photos. We will arrange a free replacement or full refund.

### Contact
For any return or refund queries, reach us at **[your@email.com]**` },
]

// Built-in store routes for the page picker
const BUILTIN_PAGES = [
  { label: "Home",         url: "/" },
  { label: "All Products", url: "/products" },
  { label: "Collections",  url: "/collections" },
  { label: "Categories",   url: "/categories" },
  { label: "Search",       url: "/search" },
]

function ProductDetailSettings({ settings, onChange, isDark }: {
  settings: ProductDetailSettings
  onChange: (patch: Partial<ProductDetailSettings>) => void
  isDark: boolean
}) {
  const textFaint  = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const hoverBg    = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"

  const defaultOrder: ProductDetailSettings["element_order"] = 
    ["title", "price", "colors", "sizes", "quantity", "atc", "description", "meta"]
  const order = settings.element_order ?? defaultOrder

  const moveElement = (key: string, dir: "up" | "down") => {
    const arr = [...order]
    const i = arr.indexOf(key as any)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange({ element_order: arr })
  }

  const ELEMENT_META: Record<string, { label: string; icon: string }> = {
    title:       { label: "Product Title",    icon: "T" },
    price:       { label: "Price",            icon: "₹" },
    colors:      { label: "Color Options",    icon: "🎨" },
    sizes:       { label: "Size Options",     icon: "S" },
    quantity:    { label: "Quantity Stepper", icon: "#" },
    atc:         { label: "Add to Cart",      icon: "🛒" },
    description: { label: "Description",      icon: "📝" },
    meta:        { label: "Secure Badge",     icon: "🔒" },
  }

  return (
    <div className="space-y-4">

      {/* ── Element order ── */}
      <StyleSection title="Element Order" isDark={isDark}>
        <p className={`text-[10px] ${textFaint} mb-2 opacity-70`}>
          Drag or use arrows to reorder product page elements.
        </p>
        <div className="space-y-1.5">
          {order.map((key, i) => {
            const meta = ELEMENT_META[key]
            if (!meta) return null
            return (
              <div key={key} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
                isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
              }`}>
                <GripVertical className={`w-3 h-3 shrink-0 ${textFaint}`} />
                <span className="w-5 text-sm text-center">{meta.icon}</span>
                <span className={`flex-1 text-xs font-medium ${textPrimary}`}>{meta.label}</span>
                <button onClick={() => moveElement(key, "up")} disabled={i === 0}
                  className={`p-0.5 rounded ${i === 0 ? "opacity-30" : hoverBg}`}>
                  <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                </button>
                <button onClick={() => moveElement(key, "down")} disabled={i === order.length - 1}
                  className={`p-0.5 rounded ${i === order.length - 1 ? "opacity-30" : hoverBg}`}>
                  <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                </button>
              </div>
            )
          })}
        </div>
      </StyleSection>

      {/* ── Title settings ── */}
      <StyleSection title="Product Title" isDark={isDark}>
        <div className="space-y-2.5">
          <Field label="Size" faint={textFaint}>
            <div className="grid grid-cols-4 gap-1">
              {(["sm","md","lg","xl"] as const).map(s => (
                <button key={s} onClick={() => onChange({ title_size: s })}
                  className={`py-1.5 rounded-lg border text-xs transition-all ${
                    (settings.title_size ?? "lg") === s
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{s.toUpperCase()}</button>
              ))}
            </div>
          </Field>
          <Field label="Weight" faint={textFaint}>
            <div className="grid grid-cols-4 gap-1">
              {(["normal","semibold","bold","extrabold"] as const).map(w => (
                <button key={w} onClick={() => onChange({ title_weight: w })}
                  className={`py-1.5 rounded-lg border text-[10px] transition-all ${
                    (settings.title_weight ?? "bold") === w
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{w}</button>
              ))}
            </div>
          </Field>
          <Field label="Color" faint={textFaint}>
            <div className="flex gap-1.5">
              {settings.title_color ? (
                <>
                  <input type="color" value={settings.title_color}
                    onChange={e => onChange({ title_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={settings.title_color}
                    onChange={e => onChange({ title_color: e.target.value })}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button onClick={() => onChange({ title_color: undefined })} className="text-red-400 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button onClick={() => onChange({ title_color: isDark ? "#ffffff" : "#111827" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                    isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                           : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>
        </div>
      </StyleSection>

      {/* ── Price settings ── */}
      <StyleSection title="Price" isDark={isDark}>
        <div className="space-y-2.5">
          <Field label="Size" faint={textFaint}>
            <div className="grid grid-cols-4 gap-1">
              {(["sm","md","lg","xl"] as const).map(s => (
                <button key={s} onClick={() => onChange({ price_size: s })}
                  className={`py-1.5 rounded-lg border text-xs transition-all ${
                    (settings.price_size ?? "lg") === s
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{s.toUpperCase()}</button>
              ))}
            </div>
          </Field>
          <Field label="Color" faint={textFaint}>
            <div className="flex gap-1.5">
              {settings.price_color ? (
                <>
                  <input type="color" value={settings.price_color}
                    onChange={e => onChange({ price_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={settings.price_color}
                    onChange={e => onChange({ price_color: e.target.value })}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button onClick={() => onChange({ price_color: undefined })} className="text-red-400 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button onClick={() => onChange({ price_color: "#e65100" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                    isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                           : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>
        </div>
      </StyleSection>

      {/* ── Color swatches ── */}
      <StyleSection title="Color Options" isDark={isDark}>
        <div className="space-y-2.5">
          <Field label="Label text" faint={textFaint}>
            <EditorInput value={settings.colors_label ?? "Color"}
              onChange={v => onChange({ colors_label: v })} placeholder="Color" isDark={isDark} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative shrink-0" onClick={() => onChange({ show_color_label: !(settings.show_color_label ?? true) })}>
              <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_color_label ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_color_label ?? true) ? "translate-x-4" : ""}`} />
            </div>
            <span className={`text-xs ${textPrimary}`}>Show color label</span>
          </label>
          <Field label="Swatch size" faint={textFaint}>
            <div className="grid grid-cols-3 gap-1">
              {(["sm","md","lg"] as const).map(s => (
                <button key={s} onClick={() => onChange({ color_swatch_size: s })}
                  className={`py-1.5 rounded-lg border text-xs transition-all ${
                    (settings.color_swatch_size ?? "md") === s
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{s.toUpperCase()}</button>
              ))}
            </div>
          </Field>
        </div>
      </StyleSection>

      {/* ── Size options ── */}
      <StyleSection title="Size Options" isDark={isDark}>
        <div className="space-y-2.5">
          <Field label="Label text" faint={textFaint}>
            <EditorInput value={settings.sizes_label ?? "Size"}
              onChange={v => onChange({ sizes_label: v })} placeholder="Size" isDark={isDark} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative shrink-0" onClick={() => onChange({ show_size_label: !(settings.show_size_label ?? true) })}>
              <div className={`w-8 h-4 rounded-full transition-colors ${(settings.show_size_label ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.show_size_label ?? true) ? "translate-x-4" : ""}`} />
            </div>
            <span className={`text-xs ${textPrimary}`}>Show size label</span>
          </label>
          <Field label="Button style" faint={textFaint}>
            <div className="grid grid-cols-3 gap-1">
              {(["pill","box","underline"] as const).map(s => (
                <button key={s} onClick={() => onChange({ size_style: s })}
                  className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    (settings.size_style ?? "pill") === s
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{s}</button>
              ))}
            </div>
          </Field>
        </div>
      </StyleSection>

      {/* ── Add to Cart ── */}
      <StyleSection title="Add to Cart Button" isDark={isDark}>
        <div className="space-y-2.5">
          <Field label="Button label" faint={textFaint}>
            <EditorInput value={settings.atc_label ?? "Add to Cart"}
              onChange={v => onChange({ atc_label: v })} placeholder="Add to Cart" isDark={isDark} />
          </Field>
          <Field label="Style" faint={textFaint}>
            <div className="grid grid-cols-3 gap-1">
              {(["filled","outline","pill"] as const).map(s => (
                <button key={s} onClick={() => onChange({ atc_style: s })}
                  className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                    (settings.atc_style ?? "pill") === s
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                      : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}>{s}</button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative shrink-0" onClick={() => onChange({ atc_full_width: !(settings.atc_full_width ?? true) })}>
              <div className={`w-8 h-4 rounded-full transition-colors ${(settings.atc_full_width ?? true) ? "bg-orange-500" : "bg-gray-600"}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(settings.atc_full_width ?? true) ? "translate-x-4" : ""}`} />
            </div>
            <span className={`text-xs ${textPrimary}`}>Full width button</span>
          </label>
        </div>
      </StyleSection>

      {/* ── Visibility toggles ── */}
      <StyleSection title="Show / Hide Elements" isDark={isDark}>
        <div className="space-y-2">
          {[
            { key: "show_quantity",     label: "Quantity stepper",  def: true },
            { key: "show_description",  label: "Description",       def: true },
            { key: "description_collapsed", label: "Description collapsed by default", def: false },
            { key: "show_secure_badge", label: "Secure checkout badge", def: true },
          ].map(({ key, label, def }) => {
            const val = (settings as any)[key] !== undefined ? (settings as any)[key] : def
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div className="relative shrink-0" onClick={() => onChange({ [key]: !val })}>
                  <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                </div>
                <span className={`text-xs ${textPrimary}`}>{label}</span>
              </label>
            )
          })}
        </div>
      </StyleSection>

      {/* ── Secure badge text ── */}
      {(settings.show_secure_badge ?? true) && (
        <StyleSection title="Secure Badge Text" isDark={isDark}>
          <EditorInput
            value={settings.secure_badge_text ?? "Secure checkout via Junooni"}
            onChange={v => onChange({ secure_badge_text: v })}
            placeholder="Secure checkout via Junooni"
            isDark={isDark}
          />
        </StyleSection>
      )}

    </div>
  )
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
function genId() { return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }
// REPLACE WITH:
function ProductPagesGroup({ value, onChange, setOpen, isDark, searchQuery }: {
  value: string
  onChange: (v: string) => void
  setOpen: (v: boolean) => void
  isDark: boolean
  searchQuery?: string
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const faint = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const products = _linkInputProductsRef.current.length > 0
    ? _linkInputProductsRef.current
    : _linkInputProducts

  const selectedProduct = products.find(p => value === `/products/${p.handle}`) ?? null

  const filteredProducts = searchQuery
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const textColor = isDark ? "text-gray-300" : "text-gray-700"

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      {/* When searching — show inline results */}
      {searchQuery ? (
        filteredProducts.length > 0 ? (
        <div>
          <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${faint}`}>
            Product pages
          </p>
          <div className="pb-1">
            {filteredProducts.slice(0, 6).map(p => {
              const url = `/products/${p.handle}`
              return (
                <button key={p.id}
                  onClick={() => { onChange(url); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors text-left ${
                    value === url ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`
                  }`}>
                  {p.thumbnail && (
                    <img src={p.thumbnail} alt={p.title}
                      className="object-cover w-5 h-5 rounded shrink-0" />
                  )}
                  <span className="flex-1 truncate">{p.title}</span>
                </button>
              )
            })}
          </div>
        </div>
        ) : null
      ) : (
        /* When not searching — show modal trigger */
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full flex items-center justify-between px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${faint} ${hoverBg}`}
        >
          <span>
            Product pages
            {selectedProduct && (
              <span className="ml-1.5 normal-case font-normal">— {selectedProduct.title}</span>
            )}
          </span>
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {modalOpen && !searchQuery && (
        <ProductPickerModal
          products={products}
          selectedProduct={selectedProduct}
          onSelect={p => {
            onChange(`/products/${p.handle}`)
            setOpen(false)
            setModalOpen(false)
          }}
          onClose={() => setModalOpen(false)}
          isDark={isDark}
        />
      )}
    </div>
  )
}

function CustomPagesGroup({ pages, value, onChange, setOpen, isDark, onLabelSuggest, isSearching }: {
  pages: StorePage[]; value: string; onChange: (v: string) => void
  setOpen: (v: boolean) => void; isDark: boolean
  onLabelSuggest?: (label: string) => void
  isSearching?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  // Auto-expand when searching
  useEffect(() => {
    if (isSearching) setExpanded(true)
    else setExpanded(false)
  }, [isSearching])
  const textColor = isDark ? "text-gray-300" : "text-gray-700"
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const faint = isDark ? "text-gray-600" : "text-gray-400"

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${textColor} ${hoverBg}`}
      >
        <span>Custom pages</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && pages.map(p => (
         <button key={p.id} onClick={() => {
          onChange(`/pages/${p.slug}`)
          onLabelSuggest?.(p.title)
          setTimeout(() => {
            setOpen(false)
          }, 0)
        }}
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
            value === `/pages/${p.slug}` ? "bg-orange-500/10 text-orange-400" : `${textColor} ${hoverBg}`
          }`}>
          <span className="pl-1 truncate">{p.title}</span>
          <span className={`font-mono text-[10px] ml-2 shrink-0 ${faint}`}>/pages/{p.slug}</span>
        </button>
      ))}
    </div>
  )
}

// ─── LinkInput — URL field with "Select page" dropdown ───────────────────────

const LINK_INPUT_DROPDOWN_HEIGHT = 280

// Resolve a URL to a human-readable label for display
function resolveUrlLabel(url: string, pages: StorePage[]): { label: string; icon: string } | null {
  if (!url || url === "#" || !url.trim()) return null

  // Built-in store pages
  const builtinMatch = BUILTIN_PAGES.find(p => p.url === url)
  if (builtinMatch) return { label: builtinMatch.label, icon: "🔗" }

  // Custom pages — match by slug, show title
  const pageMatch = pages.find(p =>
    `/pages/${p.slug}` === url || `/p/${p.slug}` === url
  )
  if (pageMatch) return { label: pageMatch.title, icon: "📄" }

  // Products — show product title
  const allProducts = _linkInputProductsRef.current.length > 0
    ? _linkInputProductsRef.current : _linkInputProducts
  const product = allProducts.find(p => `/products/${p.handle}` === url)
  if (product) return { label: product.title, icon: "🛍️" }

  // External URLs — show domain only
  if (url.startsWith("http")) {
    try {
      return { label: new URL(url).hostname, icon: "🌐" }
    } catch {
      return { label: url.replace(/^https?:\/\//, ""), icon: "🌐" }
    }
  }

  // Any other relative path — show cleanly without leading slash
  if (url.startsWith("/")) {
    const clean = url
      .replace(/^\/products\//, "")
      .replace(/^\/pages\//, "")
      .replace(/^\/collections\//, "")
      .replace(/^\/categories\//, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
    return { label: clean, icon: "🔗" }
  }

  return null
}

function LinkInput({
  value, onChange, placeholder, isDark, pages = [], onLabelSuggest,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string
  isDark: boolean; pages?: StorePage[]
  onLabelSuggest?: (label: string) => void
}){
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [displayValue, setDisplayValue] = useState(value)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  // Keep displayValue in sync with prop
  useEffect(() => { setDisplayValue(value) }, [value])

  useEffect(() => {
    if (!open) return

    const update = () => {
      if (!btnRef.current) return
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const flipUp = spaceBelow < LINK_INPUT_DROPDOWN_HEIGHT && spaceAbove > spaceBelow
      setDropdownPos({
        top: flipUp ? rect.top - LINK_INPUT_DROPDOWN_HEIGHT - 4 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }

    // Initial position
    update()

    // Only update on scroll/resize — not every frame
    const scrollEls = document.querySelectorAll(".custom-scrollbar, .overflow-y-auto")
    scrollEls.forEach(el => el.addEventListener("scroll", update, { passive: true }))
    window.addEventListener("resize", update, { passive: true })

    return () => {
      scrollEls.forEach(el => el.removeEventListener("scroll", update))
      window.removeEventListener("resize", update)
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setSearchQuery(displayValue) // pre-fill with current value
    setOpen(o => !o)
  }

  return (
    <div ref={ref} className="relative flex gap-1">
       {(() => {
        const resolved = resolveUrlLabel(displayValue, pages)
        const hasValue = displayValue && displayValue.trim() && displayValue !== "#"
        if (hasValue && !open) {
          return (
            <div
              ref={btnRef as any}
              onClick={() => {
                setSearchQuery("")
                handleOpen()
              }}
              className={`flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer border transition-colors ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="text-sm shrink-0">
                {resolved?.icon ?? "🔗"}
              </span>
              <span className={`text-sm truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {resolved?.label ?? displayValue}
              </span>
            </div>
          )
        }
        return (
          <input
            value={searchQuery || displayValue}
            onChange={e => {
              const v = e.target.value
              setSearchQuery(v)
              setDisplayValue(v)
              if (v.startsWith("http") || v.startsWith("/") || v === "") onChange(v)
              if (!open) {
                if (btnRef.current) {
                  const rect = btnRef.current.getBoundingClientRect()
                  setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                }
                setOpen(true)
              }
            }}
            onFocus={() => {
              setSearchQuery(value)
              if (btnRef.current) {
                const rect = btnRef.current.getBoundingClientRect()
                setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
              }
              setOpen(true)
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const isUrl = searchQuery.startsWith("http") || searchQuery.startsWith("/")
                if (isUrl) { onChange(searchQuery.trim()); setOpen(false); setSearchQuery("") }
              }
              if (e.key === "Escape") { setOpen(false); setSearchQuery("") }
            }}
            placeholder={placeholder ?? "Search or paste link"}
            className={`flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors ${
              isDark
                ? "bg-gray-800 border border-gray-700 text-gray-200"
                : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"
            }`}
          />
        )
      })()}
     {value && !open ? (
        <button
          type="button"
           onClick={() => { onChange(""); setDisplayValue("") }}
          title="Clear"
          className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
            isDark
              ? "border-gray-700 text-gray-500 hover:border-red-800 hover:text-red-400"
              : "border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500"
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      ) : (
        <button
          ref={btnRef}
          type="button"
          onClick={handleOpen}
          title="Select a page"
          className={`shrink-0 flex items-center gap-0.5 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-colors ${
            open
              ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
              : isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200" : "border-gray-300 text-gray-500 hover:border-gray-400"
          }`}
        >
          <FileText className="w-3 h-3" />
          <ChevronDownIcon className="w-2.5 h-2.5" />
        </button>
      )}

     {open && (
        <div
          className={`fixed z-[9999] w-52 rounded-xl border shadow-xl overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
         style={{
            top: dropdownPos.top,
            right: dropdownPos.right,
            maxHeight: LINK_INPUT_DROPDOWN_HEIGHT,
            overflowY: "auto",
          }}
        >
           <p className={`px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-b ${isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"}`}>
            {searchQuery ? `Results for "${searchQuery}"` : "Select page"}
          </p>
          <div className={`px-1.5 py-1 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            {!searchQuery && <p className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${isDark ? "text-gray-600" : "text-gray-400"}`}>Store pages</p>}
            {BUILTIN_PAGES
              .filter(p => !searchQuery || p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.url.includes(searchQuery.toLowerCase()))
              .map(p => (
              <button key={p.url} onClick={() => {
                onChange(p.url)
                setDisplayValue(p.url)  
                onLabelSuggest?.(p.label)
                setOpen(false)
                setSearchQuery("")
              }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                  value === p.url ? "bg-orange-500/10 text-orange-400" : isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
                }`}>
                <span>{p.label}</span>
                <span className={`font-mono text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>{p.url}</span>
              </button>
            ))}
          </div>

           {searchQuery && (() => {
            const builtinMatches = BUILTIN_PAGES.filter(p =>
              p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.url.includes(searchQuery.toLowerCase())
            )
            const pageMatches = pages.filter(p =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.slug.includes(searchQuery.toLowerCase())
            )
            const productMatches = _linkInputProductsRef.current.filter(p =>
              p.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            const totalMatches = builtinMatches.length + pageMatches.length + productMatches.length
            if (totalMatches === 0) {
              return (
                <div className={`px-3 py-4 text-center`}>
                  <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No pages found for "{searchQuery}"
                  </p>
                  <p className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    Try a different search or paste a URL directly
                  </p>
                </div>
              )
            }
            return null
          })()}
          
          {pages.length > 0 && (
             <CustomPagesGroup
              pages={pages.filter(p =>
                !searchQuery ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.slug.includes(searchQuery.toLowerCase())
              )}
              value={value}
                onChange={(v) => {
                onChange(v)
                setDisplayValue(v)
                setOpen(false)      // ← force close immediately
                setSearchQuery("")  // ← clear search immediately
              }}
              setOpen={setOpen}
              isDark={isDark}
              onLabelSuggest={onLabelSuggest}
              isSearching={!!searchQuery}
            />
          )}

           <ProductPagesGroup
            value={displayValue}
            onChange={(v) => {
              onChange(v)
              setDisplayValue(v)  // ← update display immediately
              setOpen(false)
              setSearchQuery("")
            }}
            setOpen={setOpen}
            isDark={isDark}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  )
}

function getLayoutKeyForPath(path: string): string {
  if (!path || path === "/") return "home"
  if (path === "/products") return "products"
  if (path === "/categories") return "categories"
  if (path === "/collections") return "collections"
  if (path === "/cart") return "cart"
  if (path === "/search") return "search"
  if (path.startsWith("/products/")) return "product"
  if (path.startsWith("/collections/")) return "collection"
  if (path.startsWith("/categories/")) return "category"
  if (path.startsWith("/pages/")) return `page_${path.replace("/pages/", "")}`
  return "home"
}
 
function getPageSections(store: VendorStore, layoutKey: string): StoreSection[] {
  if (layoutKey === "home") {
    return (store.sections?.sections ?? []).map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  }
  const stored = (store.sections as any)?.page_layouts?.[layoutKey]?.sections
  if (stored && stored.length > 0) {
    return stored.map((s: any, i: number) => ({ ...s, id: s.id ?? genId() }))
  }
  // Return defaults for this page type
  const meta = PAGE_LAYOUT_META[layoutKey]
  return (meta?.defaultSections ?? []).map((s: any) => ({ ...s, id: s.id ?? genId() }))
}
 
function setPageSections(store: VendorStore, layoutKey: string, newSections: StoreSection[]): VendorStore {
  if (layoutKey === "home") {
    return { ...store, sections: { ...(store.sections ?? {}), sections: newSections } }
  }
  const existingSections = store.sections ?? { sections: [] }
  const existingLayouts = (existingSections as any).page_layouts ?? {}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StoreEditorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const fileLogoRef = useRef<HTMLInputElement>(null)
  const fileFavRef = useRef<HTMLInputElement>(null)
  const fileOgRef = useRef<HTMLInputElement>(null)

  const [store, setStore] = useState<VendorStore>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [vendorHandle, setVendorHandle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState<EditorTab>("layout")
  const [editingPage, setEditingPage] = useState<StorePage | null>(null)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingFav, setIsUploadingFav] = useState(false)
  const [isUploadingOg, setIsUploadingOg] = useState(false)
  const [editorTheme, setEditorTheme] = useState<"dark" | "light">("light")
  const [addSectionOpen, setAddSectionOpen] = useState(false)
  const [addSectionFilter, setAddSectionFilter] = useState("all")
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null) // null = append
  const [vendorCollections, setVendorCollections] = useState<{ id: string; title: string; handle: string }[]>([])
  const [vendorCategories, setVendorCategories] = useState<{ id: string; name: string; handle: string; product_count: number }[]>([])
  const [vendorProducts, setVendorProducts] = useState<{ id: string; title: string; handle: string; thumbnail?: string; variants?: any[]; options?: any[] }[]>([])
   useEffect(() => {
    _linkInputProducts = vendorProducts
    _linkInputProductsRef.current = vendorProducts
  }, [vendorProducts])
   _linkInputProducts = vendorProducts
  _linkInputProductsRef.current = vendorProducts
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [headerPickerOpen, setHeaderPickerOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  // Page switcher — controls which page the iframe preview shows
  const [previewPagePath, setPreviewPagePath] = useState<string>("/") // relative path e.g. "/" | "/products" | "/p/about-me"

  const isDark = editorTheme === "dark"
  const token = localStorage.getItem("vendorToken")
  const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL
  //const sections = (store.sections?.sections ?? []).map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  const currentLayoutKey  = getLayoutKeyForPath(previewPagePath)
  const currentLayoutMeta = PAGE_LAYOUT_META[currentLayoutKey] ?? PAGE_LAYOUT_META.home
 
  // Global header/footer — always from home sections
  const homeSections = (store.sections?.sections ?? [])
    .map((s, i) => ({ ...s, id: s.id ?? `s_${i}` }))
  const headerSections = homeSections.filter(s => s.type === "announcement" || s.type === "ticker")
  const footerSections = homeSections.filter(s => s.type === "footer")
 
  // Body sections — per page
  // In StoreEditorPage, update bodySections:
  const bodySections = currentLayoutKey === "home"
  ? homeSections.filter(s => !["header", "announcement", "footer"].includes(s.type))
  : getPageSections(store, currentLayoutKey).filter(
      s => s.id !== "__category_grid__"
        && s.id !== "__category_products__"
        && s.id !== "__collections_grid__"
        && s.id !== "__collection_products__"  // ← ADD
    )
 
  // sections var — used by drag/drop and selectedSection lookup
  const sections = currentLayoutKey === "home"
  ? homeSections
  : [...headerSections, ...bodySections, ...footerSections]
    .filter(s =>
      s.id !== "__category_grid__" &&
      s.id !== "__category_products__" &&
      s.id !== "__collections_grid__" &&
      s.id !== "__collection_products__"
    )
  const pages = store.pages?.pages ?? []

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
  const load = async () => {
    if (!token) { navigate({ to: "/sign-in" }); return }
    try {

      // ── 1. Fetch vendor handle ──────────────────────────────────────────────
      let vd: any = {}
      const vRes = await fetch(`${backendUrl}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (vRes.ok) {
        vd = await vRes.json()
        setVendorHandle(vd.vendor?.handle ?? "")
      }

      // ── 2. Fetch store ──────────────────────────────────────────────────────
      const sRes = await fetch(`${backendUrl}/vendors/me/store`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (sRes.ok) {
        const sd = await sRes.json()
        if (sd.store) {
          // Map home sections with IDs
          const secs = (sd.store.sections?.sections ?? []).map(
            (s: any) => ({ ...s, id: s.id ?? genId() })
          )

          // Map page_layout sections with IDs
          const rawLayouts = sd.store.sections?.page_layouts ?? {}
          const mappedLayouts: Record<string, { sections: any[] }> = {}
          for (const [key, layout] of Object.entries(rawLayouts)) {
            mappedLayouts[key] = {
              sections: ((layout as any).sections ?? []).map(
                (s: any) => ({ ...s, id: s.id ?? genId() })
              )
            }
          }

           const rawFooterSec = secs.find((s: any) => s.type === "footer")
          if (rawFooterSec?.footer_columns) {
            const seen = new Set<string>()
            const deduped = rawFooterSec.footer_columns.filter((c: FooterColumn) => {
              const key = c.heading.toLowerCase().trim()
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
            if (deduped.length !== rawFooterSec.footer_columns.length) {
              const idx = secs.findIndex((s: any) => s.type === "footer")
              secs[idx] = { ...rawFooterSec, footer_columns: deduped }
            }
          }

          const loadedStore = {
            ...sd.store,
            sections: {
              sections: secs,
              page_layouts: mappedLayouts,
            }
          }

          // ── Auto-seed 3 legal pages if missing ─────────────────────
          const existingPages: any[] = loadedStore.pages?.pages ?? []
          const hasTerms   = existingPages.some((p: any) => p.template === "terms")
          const hasPrivacy = existingPages.some((p: any) => p.template === "privacy")
          const hasReturns = existingPages.some((p: any) => p.template === "returns")

          if (!hasTerms || !hasPrivacy || !hasReturns) {
            const today = new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })
            const seedPages = [...existingPages]

            if (!hasTerms) seedPages.push({
              id: `page_${Date.now()}_terms`,
              title: "Terms of Service",
              slug: "terms-of-service",
              template: "terms",
              in_nav: false,
              in_footer: true,
              created_at: new Date().toISOString(),
              content: PAGE_TEMPLATES.find(t => t.id === "terms")!.defaultContent.replace("{{CREATED_DATE}}", today),
            })

            if (!hasPrivacy) seedPages.push({
              id: `page_${Date.now() + 1}_privacy`,
              title: "Privacy Policy",
              slug: "privacy-policy",
              template: "privacy",
              in_nav: false,
              in_footer: true,
              created_at: new Date().toISOString(),
              content: PAGE_TEMPLATES.find(t => t.id === "privacy")!.defaultContent.replace("{{CREATED_DATE}}", today),
            })

            if (!hasReturns) seedPages.push({
              id: `page_${Date.now() + 2}_returns`,
              title: "Returns & Refunds",
              slug: "returns-refunds",
              template: "returns",
              in_nav: false,
              in_footer: true,
              created_at: new Date().toISOString(),
              content: PAGE_TEMPLATES.find(t => t.id === "returns")!.defaultContent.replace("{{CREATED_DATE}}", today),
            })

            loadedStore.pages = { pages: seedPages }
          }
          // ── End seed ────────────────────────────────────────────────

          if (!hasTerms || !hasPrivacy || !hasReturns) {
            fetch(`${backendUrl}/vendors/me/store`, {
              method: "PUT",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...loadedStore, pages: loadedStore.pages }),
            }).catch(e => console.warn("Auto-save seeded pages failed:", e))
          }
          // setStore AFTER seeding so pages are included from the start
          setStore({
            ...loadedStore,
            instagram_url: loadedStore.instagram_url || vd.vendor?.instagram || "",
            youtube_url:   loadedStore.youtube_url   || vd.vendor?.youtube   || "",
            twitter_url:   loadedStore.twitter_url   || vd.vendor?.xtwitter  || "",
            facebook_url:  loadedStore.facebook_url  || vd.vendor?.facebook  || "",
          })
          setHasStore(true)

          // ── Collections come from store.collections.collections ──
          const storeCollections = sd.store.collections?.collections ?? []
          setVendorCollections(storeCollections.map((c: any) => ({
            id: c.id,
            title: c.title ?? c.name ?? c.handle,
            handle: c.handle,
          })))
        }
      }

      // ── 3. Fetch products — derives vendorProducts + vendorCategories ───────
      try {
        const prodRes = await fetch(
          `${backendUrl}/vendors/products?limit=200&status=published&store_only=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (prodRes.ok) {
          const prodData = await prodRes.json()
          const allProds = prodData.products ?? []

          const prods = allProds.filter((p: any) => p.status === "published")

          setVendorProducts(prods.map((p: any) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            thumbnail: p.thumbnail,
            variants: p.variants,
            options: p.options,
          })))

          const catMap = new Map<string, {
            id: string; name: string; handle: string; product_count: number
          }>()
          for (const p of prods) {
            for (const c of (p.categories ?? [])) {
              if (!c?.id) continue
              const existing = catMap.get(c.id)
              catMap.set(c.id, {
                id: c.id,
                name: c.name ?? c.handle,
                handle: c.handle,
                product_count: (existing?.product_count ?? 0) + 1,
              })
            }
          }
          setVendorCategories([...catMap.values()].filter(c => c.product_count > 0))
        }
      } catch (e) {
        console.warn("Could not load products/categories:", e)
      }

    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }
  load()
}, [])


// REPLACE WITH:
const isFirstRender = useRef(true)
useEffect(() => {
  if (isLoading) return
  if (isFirstRender.current) { isFirstRender.current = false; return }
  setHasUnsavedChanges(true)
}, [store, isLoading])

useEffect(() => {
  const handleDragEnd = () => {
    setIsDragging(null)
    setDragOver(null)
  }
  document.addEventListener("dragend", handleDragEnd)
  return () => document.removeEventListener("dragend", handleDragEnd)
}, [])

  // ── postMessage listener ──────────────────────────────────────────────────

   // FIND:
  const syncToIframe = useCallback(() => {
    if (!iframeReady) return
    isSyncingRef.current = true
    iframeRef.current?.contentWindow?.postMessage({ type: "STORE_UPDATE", store, selectedId }, "*")
    setTimeout(() => { isSyncingRef.current = false }, 100)
  }, [store, selectedId, iframeReady])

  const isSyncingRef = useRef(false)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "SECTION_CLICK" && !isSyncingRef.current) {
        setSelectedId(e.data.sectionId)
        setActiveTab("layout")
        setRightPanelOpen(true)
      }
      if (e.data?.type === "IFRAME_READY") {
        setIframeReady(true)
        setTimeout(() => syncToIframe(), 100)
      }
      if (e.data?.type === "IFRAME_NAVIGATION") {
        const path: string = e.data.path ?? "/"
        // Normalize to layout key paths
        const normalized =
          path === "/" ? "/" :
          path.startsWith("/products/") ? `/products/${path.split("/")[2]}` :
          path.startsWith("/collections/") ? `/collections/${path.split("/")[2]}` :
          path.startsWith("/categories/") ? `/categories/${path.split("/")[2]}` :
          path

        setPreviewPagePath(normalized)
        setSelectedId(null)
        setRightPanelOpen(false)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [syncToIframe])

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!iframeReady) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => syncToIframe(), 50)
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current) }
  }, [store, selectedId, iframeReady, syncToIframe])

  // ── Save ──────────────────────────────────────────────────────────────────
  // FIND:
    const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...store, subdomain: store.subdomain || vendorHandle }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setStore(p => ({ ...p, ...data.store }))
      setHasStore(true)
      setHasUnsavedChanges(false)

      // Push to iframe via postMessage first (instant, no flicker)
      iframeRef.current?.contentWindow?.postMessage({ type: "STORE_UPDATE", store: data.store, selectedId }, "*")
      iframeRef.current?.contentWindow?.postMessage({ type: "STORE_SAVED" }, "*")

      toast({ title: "Saved! ✓", description: "Your store has been updated." })

      // Only hard-reload for server-rendered custom pages (/p/slug)
      // where postMessage can't update server component output
      if (previewPagePath.startsWith("/pages/")) {
        setTimeout(() => {
          if (iframeRef.current) {
            const src = iframeRef.current.src
            iframeRef.current.src = ""
            setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src }, 100)
          }
        }, 600)
      }
    } catch (e) {
      toast({ title: "Save failed", description: String(e), variant: "destructive" })
    } finally { setIsSaving(false) }
  }

  // ── Toggle live/draft ─────────────────────────────────────────────────────
  const handleToggleStatus = async () => {
    const newStatus = store.status === "live" ? "draft" : "live"
    setIsTogglingStatus(true)
    try {
      const res = await fetch(`${backendUrl}/vendors/me/store`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setStore(p => ({ ...p, status: newStatus }))
      toast({ title: newStatus === "live" ? "🎉 Store is now live!" : "Store set to draft" })
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" })
    } finally { setIsTogglingStatus(false) }
  }

  // ── File upload helper ────────────────────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!res.ok) return null
    const data = await res.json()
    return data.files?.[0]?.url ?? null
  }

  // ── Section helpers ───────────────────────────────────────────────────────
  const patchStore = useCallback((updater: (p: VendorStore) => VendorStore) => setStore(updater), [])
  const updateSection = useCallback((id: string, patch: Partial<StoreSection>) => {
    patchStore(p => {
      // Check if it's a home-level section (header/announcement/footer)
      const homeSecs = p.sections?.sections ?? []
      if (homeSecs.some(s => s.id === id)) {
        return {
          ...p,
          sections: {
            ...p.sections,
            sections: homeSecs.map(s => s.id === id ? { ...s, ...patch } : s),
          }
        }
      }
      // Otherwise patch the page layout
      const key = getLayoutKeyForPath(previewPagePath)
      const current = getPageSections(p, key)
      const updated = current.map(s => s.id === id ? { ...s, ...patch } : s)
      return setPageSections(p, key, updated)
    })
  }, [patchStore, previewPagePath])
  // REPLACE WITH:
  const removeSection = useCallback((id: string) => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const current = getPageSections(p, key)
      return setPageSections(p, key, current.filter(s => s.id !== id))
    })
    if (selectedId === id) { setSelectedId(null); setRightPanelOpen(false) }
  }, [previewPagePath, selectedId, patchStore])

  const duplicateSection = useCallback((id: string) => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr = [...getPageSections(p, key)]
      const idx = arr.findIndex(s => s.id === id)
      if (idx === -1) return p
      const copy = { ...arr[idx], id: genId() }
      arr.splice(idx + 1, 0, copy)
      return setPageSections(p, key, arr)
    })
  }, [previewPagePath, patchStore])
  const toggleSection = (id: string) => {
    const s = sections.find(s => s.id === id)
    if (s) updateSection(id, { hidden: !s.hidden })
  }
  
  const moveSection = (id: string, dir: "up" | "down") => {
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr = [...getPageSections(p, key)]
      const i = arr.findIndex(s => s.id === id)
      const swap = dir === "up" ? i - 1 : i + 1
      if (swap < 0 || swap >= arr.length) return p
      ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
      return setPageSections(p, key, arr)
    })
  }
  const addSection = (type: SectionType) => {
    const key = getLayoutKeyForPath(previewPagePath)
    const ns: StoreSection = {
      id: genId(), type,
      ...(type === "hero" ? { headline: "Your Headline", subtext: "Your tagline goes here", cta_label: "Shop Now", cta_secondary_label: "Browse all", cta_secondary_url: "/products" } : {}),
      ...(type === "collection" ? { title: "All Products", limit: 12, columns: 3, show_sold_out: true } : {}),
      ...(type === "featured" ? { title: "Featured Drops", limit: 4, columns: 4 } : {}),
      ...(type === "about" ? { title: "About Me", text: "Share your story..." } : {}),
      ...(type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: BRAND.primary, text_color: "#ffffff" } : {}),
      ...(type === "social" ? { show_instagram: true, show_youtube: true, show_twitter: true } : {}),
      ...(type === "video" ? { title: "Watch me", video_url: "" } : {}),
      ...(type === "text" ? { text: "Add your content here." } : {}),
      ...(type === "links" ? { title: "My Links", links: [{ id: genId(), label: "My YouTube", url: "https://youtube.com" }, { id: genId(), label: "Latest Drop", url: "#" }] } : {}),
      ...(type === "html" ? { html_content: "<div style=\"padding:40px;text-align:center\">\n  <h2>Custom Section</h2>\n  <p>Add any HTML here</p>\n</div>" } : {}),
      ...(type === "featured_collections" ? { title: "Shop by Collection", collection_ids: [], columns: 3 } : {}),
      ...(type === "header" ? { logo_position: "left", show_social_icons: false, nav_items: [] } : {}),
      ...(type === "footer" ? { show_newsletter: false } : {}),
      ...(type === "ticker" ? { ticker_items: ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"], ticker_speed: 40, ticker_separator: "✦", background_color: "#111827", text_color: "#ffffff" } : {}),
      ...(type === "image_text" ? { title: "Our Story", text: "Share something meaningful.", image_position: "left", cta_label: "Learn More", cta_url: "#about" } : {}),
      ...(type === "video_text" ? { title: "Watch & Shop", text: "Tell your audience what this video is about.", image_position: "left", video_text_url: "", cta_label: "Shop Now", cta_url: "/products" } : {}),
      ...(type === "featured_product" ? { title: "Fan Favourite", text: "Describe why this product is special.", image_position: "right", cta_label: "Get Yours", cta_url: "/products" } : {}),
    }
 
    patchStore(p => {
      if (key === "home") {
        // Home: respect header/footer zones
        const arr = [...(p.sections?.sections ?? [])]
        const footerIdx = arr.findIndex(s => s.type === "footer")
        if (type === "header") arr.unshift(ns)
        else if (type === "footer") arr.push(ns)
        else if (insertAtIndex !== null) arr.splice(insertAtIndex + 1, 0, ns)
        else if (footerIdx !== -1) arr.splice(footerIdx, 0, ns)
        else arr.push(ns)
        return { ...p, sections: { ...(p.sections ?? {}), sections: arr } }
      } else {
        const current = getPageSections(p, key)
        // Exclude virtual sections from positioning logic
       const realSections = current.filter((s: any) => 
      s.id !== "__category_grid__" &&
      s.id !== "__category_products__" &&
      s.id !== "__collections_grid__" &&  // ← ADD
      s.id !== "__collection_products__"
    )
        const virtualSections = current.filter((s: any) => 
      s.id === "__category_grid__" ||
      s.id === "__category_products__" ||
      s.id === "__collections_grid__" ||  // ← ADD
      s.id === "__collection_products__"
    )
        
        const insertIdx = insertAtIndex !== null ? insertAtIndex + 1 : realSections.length
        realSections.splice(insertIdx, 0, ns)
        
        // Always keep virtual sections at end of array (they don't render as body sections)
        return setPageSections(p, key, [...realSections, ...virtualSections])
      }
    })
 
    setInsertAtIndex(null)
    setSelectedId(ns.id)
    setAddSectionOpen(false)
    setActiveTab("layout")
    setLeftPanelOpen(false)
    setRightPanelOpen(true)
  }
  const handleDragStart = (id: string) => setIsDragging(id)
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOver(idx) }
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (!isDragging) return
    const key = getLayoutKeyForPath(previewPagePath)
    patchStore(p => {
      const arr = [...getPageSections(p, key)]
      const fromIdx = arr.findIndex(s => s.id === isDragging)
      if (fromIdx === -1) return p
      const [moved] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, moved)
      return setPageSections(p, key, arr)
    })
    setIsDragging(null)
    setDragOver(null)
  }
  const handleBodyDrop = (e: React.DragEvent) => {
  e.preventDefault()
  if (!isDragging) return
  const key = getLayoutKeyForPath(previewPagePath)
  patchStore(p => {
    const arr = [...getPageSections(p, key)]
    const fromIdx = arr.findIndex(s => s.id === isDragging)
    if (fromIdx === -1) return p
    const [moved] = arr.splice(fromIdx, 1)
    const toIdx = dragOver !== null ? dragOver : arr.length
    arr.splice(toIdx, 0, moved)
    return setPageSections(p, key, arr)
  })
  setIsDragging(null)
  setDragOver(null)
}

const handleBodyDragOver = (e: React.DragEvent) => e.preventDefault()

  // ── Page helpers ──────────────────────────────────────────────────────────
  // const savePage = (page: StorePage) => {
  //   const existing = pages.find(p => p.id === page.id)
  //   const updated = existing ? pages.map(p => p.id === page.id ? page : p) : [...pages, page]
  //   patchStore(p => ({ ...p, pages: { pages: updated } }))
  //   setEditingPage(null)
  // }
  // REPLACE WITH:
  // REPLACE WITH:
  // REPLACE WITH:
  // REPLACE WITH:
  const savePage = (page: StorePage) => {
    const existing = pages.find(p => p.id === page.id)
    const updated = existing ? pages.map(p => p.id === page.id ? page : p) : [...pages, page]
    
    patchStore(p => {
      const freshStore = { ...p, pages: { pages: updated } }
      
      fetch(`${backendUrl}/vendors/me/store`, {
        method: hasStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(freshStore),
      })
        .then(res => {
          if (!res.ok) throw new Error(`${res.status}`)
          setHasUnsavedChanges(false)
          toast({ title: "Page saved ✓", description: "Your page has been updated." })
          // Force full src reset so Next.js server component re-fetches from DB
          if (iframeRef.current) {
            const src = iframeRef.current.src
            iframeRef.current.src = ""
            setTimeout(() => {
              if (iframeRef.current) iframeRef.current.src = src
            }, 100)
          }
        })
        .catch(e => {
          toast({ title: "Save failed", description: String(e), variant: "destructive" })
        })

      return freshStore
    })

    setEditingPage(null)
  }
  const deletePage = (id: string) => {
    patchStore(p => ({ ...p, pages: { pages: pages.filter(pg => pg.id !== id) } }))
    if (editingPage?.id === id) setEditingPage(null)
  }
 // REPLACE WITH:
  const startNewPage = (template: PageTemplate) => {
    const tmpl = PAGE_TEMPLATES.find(t => t.id === template)!
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    const content = tmpl.defaultContent.replace("{{CREATED_DATE}}", today)
    setEditingPage({ id: `page_${Date.now()}`, title: tmpl.label === "Blank" ? "New Page" : tmpl.label, slug: slugify(tmpl.label), template, content, in_nav: true, in_footer: false, created_at: new Date().toISOString() })
  }

   const selectedSection = selectedId
  ? (sections.find(s => s.id === selectedId)
      ?? homeSections.find(s => s.id === selectedId)
      ?? null)
  : null
  const isLive = store.status === "live"

  // Build preview URL correctly:
  // getPreviewUrl returns e.g. "http://localhost:3000/meenalhandle?__editor=1&__preview=1"
  // We must insert the page path into the PATHNAME, before the query string.
  const basePreviewUrl = vendorHandle ? getPreviewUrl(vendorHandle) : null
  const previewUrl = (() => {
    if (!basePreviewUrl) return null
    try {
      const u = new URL(basePreviewUrl)
      // u.pathname is e.g. "/meenalhandle" — append the sub-path to it
      if (previewPagePath !== "/") {
        u.pathname = u.pathname.replace(/\/$/, "") + previewPagePath
      }
      return u.toString()
    } catch {
      // Fallback for relative URLs or parse failures
      if (previewPagePath === "/") return basePreviewUrl
      const [base, qs] = basePreviewUrl.split("?")
      return `${base.replace(/\/$/, "")}${previewPagePath}${qs ? "?" + qs : ""}`
    }
  })()

  // ── Panel style helpers ───────────────────────────────────────────────────
  const panelBg     = useMemo(() => isDark ? "bg-gray-900" : "bg-white", [isDark])
  const panelBorder = useMemo(() => isDark ? "border-gray-800" : "border-gray-200", [isDark])
  const textPrimary = useMemo(() => isDark ? "text-white" : "text-gray-900", [isDark])
  const textMuted   = useMemo(() => isDark ? "text-gray-400" : "text-gray-500", [isDark])
  const textFaint   = useMemo(() => isDark ? "text-gray-500" : "text-gray-400", [isDark])
  const inputCls    = useMemo(() => isDark
    ? `bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-orange-500`
    : `bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500`
  , [isDark])
  const hoverBg = useMemo(() => isDark ? "hover:bg-gray-800" : "hover:bg-gray-50", [isDark])

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  )

  // ── Left panel content ────────────────────────────────────────────────────
   const LeftPanelContent = (
    <>
      <div className={`flex shrink-0 border-b ${panelBorder}`}>
        {([
          { id: "layout", label: "Layout" },
          { id: "style",  label: "Style" },
          { id: "pages",  label: "Pages" },
          { id: "theme",  label: "Theme" },
        ] as { id: EditorTab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-all border-b-2 ${
              activeTab === t.id
                ? "border-orange-500 text-orange-500"
                : `border-transparent ${textFaint} ${hoverBg}`
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain"
          onScroll={() => {
        if (isDragging) {
          setIsDragging(null)
          setDragOver(null)
        }
      }}>

        {/* ══ LAYOUT TAB ══════════════════════════════════════════════ */}
        {activeTab === "layout" && (() => {
          const headerSections = sections.filter(s => s.type === "announcement" || s.type === "ticker")
          const footerSections = sections.filter(s => s.type === "footer")
          const bodySections   = sections.filter(s => !["header","announcement","footer"].includes(s.type) && !headerSections.some((h: any) => h.id === s.id))

          const SectionRow = ({ s, idx }: { s: typeof sections[0], idx: number }) => {
          const block = SECTION_BLOCKS.find(b => b.type === s.type)
          const isSelected = selectedId === s.id
          const globalIdx = sections.findIndex(x => x.id === s.id)

          return (
           <div
              className="relative group/row"
              style={{ animation: "sectionFadeIn 0.15s ease-out" }}
              onDragOver={e => { e.preventDefault(); setDragOver(globalIdx) }}
            >
              <div
                draggable
                onDragStart={() => handleDragStart(s.id)}
                onDragEnd={() => { setIsDragging(null); setDragOver(null) }}
                onClick={() => {
                  setSelectedId(isSelected ? null : s.id)
                  if (!isSelected) { setRightPanelOpen(true); if (window.innerWidth < 768) setLeftPanelOpen(false) }
                  else setRightPanelOpen(false)
                }}
                className={`flex items-center gap-2 px-2 py-0.5 rounded-lg cursor-pointer active:cursor-grabbing transition-all select-none group/row ${
                  isSelected
                    ? isDark ? "bg-gray-800 border border-gray-600" : "bg-gray-100 border border-gray-300"
                    : dragOver === globalIdx
                      ? `border border-dashed ${isDark ? "bg-gray-700/50 border-blue-400" : "bg-blue-50 border-blue-300"}`
                      : `border border-transparent ${hoverBg}`
                } ${s.hidden ? "opacity-40" : ""}`}
              >
                {/* Drag handle — only on hover */}
                <GripVertical className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover/row:opacity-40 transition-opacity cursor-grab active:cursor-grabbing ${textFaint}`} />

                {/* Section icon */}
                <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
                  style={{ background: `${block?.color ?? "#666"}18`, color: block?.color ?? "#666" }}>
                  {block?.icon}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-medium truncate ${isSelected ? textPrimary : textPrimary}`}>
                    {block?.label ?? s.type}
                  </p>
                </div>

                {/* Actions — only on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0">
                  {!s.id?.startsWith("def_") && (<>
                    <button onClick={e => { e.stopPropagation(); toggleSection(s.id) }}
                      className={`p-1 rounded-md ${hoverBg}`} title={s.hidden ? "Show" : "Hide"}>
                      {s.hidden
                        ? <EyeOff className={`w-3 h-3 ${textFaint}`} />
                        : <Eye className={`w-3 h-3 ${textFaint}`} />
                      }
                    </button>
                    <button onClick={e => { e.stopPropagation(); duplicateSection(s.id) }}
                      className={`p-1 rounded-md ${hoverBg}`} title="Duplicate">
                      <Copy className={`w-3 h-3 ${textFaint}`} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); removeSection(s.id) }}
                      className={`p-1 rounded-md ${isDark ? "hover:bg-red-900/40" : "hover:bg-red-50"}`} title="Delete">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>)}
                </div>
              </div>
            </div>
          )
        }

           const ZoneLabel = ({ label, color }: { label: string; color: string }) => (
            <div className="flex items-center gap-2 px-1 pt-3 pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest opacity-50"
                style={{ color }}>{label}</span>
              <div className="flex-1 h-px opacity-20" style={{ background: color }} />
            </div>
          )

          const AddBetweenLine = ({ afterIndex }: { afterIndex: number }) => {
          const isOpen = addSectionOpen && insertAtIndex === afterIndex
          // dragOver === afterIndex means "dragging over the section AT afterIndex"
          // which means user wants to drop AFTER afterIndex-1, i.e. between afterIndex-1 and afterIndex
          const isDragTarget = !!isDragging && dragOver === afterIndex + 1

          return (
            <div className="relative" style={{ height: "16px", margin: "1px 0" }}>
              {/* Only show when hovering (not dragging) */}
              {!isDragging && (
                <div className="absolute inset-x-0 flex items-center transition-opacity -translate-y-1/2 opacity-0 top-1/2 hover:opacity-100 group/line">
                  <div className={`flex-1 h-px ${isDark ? "bg-orange-500/60" : "bg-orange-400/60"}`} />
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      if (isOpen) { setAddSectionOpen(false); setInsertAtIndex(null) }
                      else { setInsertAtIndex(afterIndex); setAddSectionOpen(true); setAddSectionFilter("all") }
                    }}
                    className="flex items-center justify-center w-5 h-5 mx-1 text-white transition-colors bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <div className={`flex-1 h-px ${isDark ? "bg-orange-500/60" : "bg-orange-400/60"}`} />
                </div>
              )}

              {/* Only show blue drop indicator when actively dragging over this gap */}
              {isDragging && isDragTarget && (
                <div className="absolute inset-x-0 flex items-center -translate-y-1/2 pointer-events-none top-1/2">
                  <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
                  <div className="w-2 h-2 mx-1 bg-blue-400 rounded-full shrink-0" />
                  <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
                </div>
              )}

              {/* Popover */}
              {isOpen && !isDragging && (
                <div className={`absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden shadow-xl ${
                  isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                }`}>
                  <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>Add section</span>
                    <button onClick={() => { setAddSectionOpen(false); setInsertAtIndex(null) }} className={`p-0.5 rounded ${textFaint} hover:text-red-400`}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex gap-1 p-1.5 overflow-x-auto border-b" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                    {[{ id: "all", label: "All" }, ...SECTION_CATEGORIES].map(cat => (
                      <button key={cat.id} onClick={() => setAddSectionFilter(cat.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                          addSectionFilter === cat.id ? "bg-orange-500 text-white" : `${textFaint} ${hoverBg}`
                        }`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-y-auto max-h-52">
                    {SECTION_BLOCKS
                      .filter(b => {
                        const allowed = PAGE_ALLOWED_SECTIONS[currentLayoutKey] ?? PAGE_ALLOWED_SECTIONS.home
                        return allowed.includes(b.type) && (addSectionFilter === "all" || b.category === addSectionFilter)
                      })
                      .map(block => (
                        <button key={block.type} onClick={() => addSection(block.type)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 transition-all text-left ${hoverBg} border-t ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
                          <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0" style={{ background: `${block.color}20`, color: block.color }}>
                            {block.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${textPrimary}`}>{block.label}</p>
                            <p className={`text-[10px] ${textFaint}`}>{block.desc}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )
        }

          // Keep AddBetweenButton as a zone-end "Add section" dashed button (only at zone end, no hover trick needed)
          const AddBetweenButton = ({ afterIndex, zone }: { afterIndex: number; zone: string }) => {
            const isOpen = addSectionOpen && insertAtIndex === afterIndex
            return (
              <div className="pt-1">
                <button
                  onClick={() => { if (isOpen) { setAddSectionOpen(false); setInsertAtIndex(null) } else { setInsertAtIndex(afterIndex); setAddSectionOpen(true); setAddSectionFilter("all") } }}
                   className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isOpen
                      ? isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-500"
                      : isDark ? `${textFaint} ${hoverBg}` : `text-gray-400 ${hoverBg}`
                  }`}
                >
                  <Plus className="w-3 h-3" /> Add section
                </button>
                {isOpen && (
                  <div className={`mt-1 rounded-xl border overflow-hidden shadow-xl ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>Add section</span>
                      <button onClick={() => { setAddSectionOpen(false); setInsertAtIndex(null) }} className={`p-0.5 rounded ${textFaint} hover:text-red-400`}><X className="w-3 h-3" /></button>
                    </div>
                    <div className="flex gap-1 p-1.5 overflow-x-auto border-b" style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}>
                      {[{ id: "all", label: "All" }, ...SECTION_CATEGORIES].map(cat => (
                        <button key={cat.id} onClick={() => setAddSectionFilter(cat.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${addSectionFilter === cat.id ? "bg-orange-500 text-white" : `${textFaint} ${hoverBg}`}`}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                    <div className="overflow-y-auto max-h-52">
                      {SECTION_BLOCKS
                        .filter(b => {
                          const allowed = PAGE_ALLOWED_SECTIONS[currentLayoutKey] ?? PAGE_ALLOWED_SECTIONS.home
                          return allowed.includes(b.type) && (addSectionFilter === "all" || b.category === addSectionFilter)
                        })
                        .map(block => (
                        <button key={block.type} onClick={() => addSection(block.type)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 transition-all text-left ${hoverBg} border-t ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
                          <div className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0" style={{ background: `${block.color}20`, color: block.color }}>{block.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${textPrimary}`}>{block.label}</p>
                            <p className={`text-[10px] ${textFaint}`}>{block.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
            <div className="p-2 pb-4 space-y-1">

              {/* ── HEADER ZONE ── */}
              <ZoneLabel label="Header" color="#6366f1" />
               <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <div className="p-1.5 space-y-1">
                  {/* Announcement rows FIRST (above Store Header) */}
                  {headerSections.length === 0 ? (
                    <div className={`flex items-center gap-2 px-2 py-2 rounded-lg opacity-50 border border-dashed ${isDark ? "border-indigo-800 text-indigo-400" : "border-indigo-300 text-indigo-500"}`}>
                      <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-indigo-500/20"><Megaphone className="w-3 h-3 text-indigo-500" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">Announcement Bar</p>
                        <p className={`text-[10px] ${textFaint}`}>Click "+ Add section" to add one</p>
                      </div>
                    </div>
                  ) : (
                    headerSections.map((s, i) => <SectionRow key={s.id} s={s} idx={i} />)
                  )}
                  {/* Locked Store Header row — always below announcements */}
                   {(() => {
                    const headerSec = homeSections.find(s => s.type === "header")
                    const headerId = headerSec?.id ?? "__store_header__"
                    const isHeaderSelected = selectedId === headerId
                    return (
                      <div
                        onClick={() => {
                          const currentSections = store.sections?.sections ?? []
                          
                          let hSec = currentSections.find((s: any) => s.type === "header")

                          // Build default nav items mirroring storefront autoNavItems logic
                          const defaultNavItems: NavItem[] = [
                            { id: "nav_home",        label: "Home",        url: "/" },
                            { id: "nav_products",    label: "All Products", url: "/products" },
                            ...(vendorCollections.length > 0 ? [{ id: "nav_collections", label: "Collections", url: "/collections" }] : []),
                            ...(vendorCategories.length  > 0 ? [{ id: "nav_categories",  label: "Categories",  url: "/categories"  }] : []),
                            ...pages
                              .filter(p => p.in_nav)
                              .map(p => ({ id: p.id, label: p.title, url: `/pages/${p.slug}` })),
                          ]

                          if (!hSec) {
                            const newId = `s_header_${Date.now()}`
                            hSec = {
                              id: newId,
                              type: "header" as SectionType,
                              logo_position: "left",
                              show_social_icons: false,
                              nav_items: defaultNavItems,
                            }
                            patchStore(p => ({
                              ...p,
                              sections: {
                                ...p.sections,
                                sections: [...(p.sections?.sections ?? []), hSec],
                              }
                            }))
                          } else if (!hSec.nav_items || hSec.nav_items.length === 0) {
                            // Header exists in DB but nav_items was never set — seed from auto logic
                            hSec = { ...hSec, nav_items: defaultNavItems }
                            patchStore(p => ({
                              ...p,
                              sections: {
                                ...p.sections,
                                sections: (p.sections?.sections ?? []).map((s: any) =>
                                  s.id === hSec!.id ? hSec! : s
                                ),
                              }
                            }))
                          }

                          setSelectedId(hSec.id)
                          setRightPanelOpen(true)
                          if (window.innerWidth < 768) setLeftPanelOpen(false)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          isHeaderSelected
                            ? "bg-indigo-500/15 border-indigo-500/40"
                            : `${isDark ? "border-indigo-800/40 bg-indigo-900/20 hover:border-indigo-600/50" : "border-indigo-200/60 bg-indigo-50/50 hover:border-indigo-400/60"}`
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-indigo-500/20">
                          <Menu className="w-3 h-3 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>Store Header</p>
                          <p className={`text-[10px] ${textFaint}`}>Nav • Logo • Search • Cart</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                          isHeaderSelected
                            ? isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                            : isDark ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-100 text-indigo-500"
                        }`}>
                          {isHeaderSelected ? "Edit" : "Auto"}
                        </span>
                      </div>
                    )
                  })()}
                </div>
                {/* <div className="px-1.5 pb-1.5">
                  <AddBetweenButton afterIndex={headerSections.length > 0 ? Math.max(...headerSections.map(s => sections.findIndex(x => x.id === s.id))) : -1} zone="header" />
                </div> */}
                <div className="px-1.5 pb-1.5">
                    <button
                      onClick={() => setHeaderPickerOpen(true)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed text-xs font-medium transition-all ${
                        isDark
                          ? "border-indigo-800/50 text-indigo-400 hover:border-indigo-600 hover:bg-indigo-900/20"
                          : "border-indigo-300 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50"
                      }`}
                    >
                      <Plus className="w-3 h-3" /> Add header section
                    </button>
                </div>
              </div>

              {/* ── BODY ZONE ── */}
             <ZoneLabel label={currentLayoutKey === "home" ? "Body" : currentLayoutMeta.label} color="#e65100" />
               <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>

                {/* Product Detail clickable row — only on product page */}
                {currentLayoutKey === "product" && (
                  <div className="px-1.5 pt-1.5">
                    <div
                      onClick={() => {
                        setSelectedId("__product_detail__")
                        setRightPanelOpen(true)
                        if (window.innerWidth < 768) setLeftPanelOpen(false)
                      }}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer border transition-all ${
                        selectedId === "__product_detail__"
                          ? "bg-pink-500/15 border-pink-500/40"
                          : `border-transparent ${hoverBg}`
                      }`}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-pink-500/20">
                        <ShoppingBag className="w-3 h-3 text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${textPrimary}`}>Product Detail</p>
                        <p className={`text-[10px] ${textFaint}`}>Title · Price · Colors · Sizes · ATC</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        isDark ? "bg-pink-900/50 text-pink-400" : "bg-pink-100 text-pink-500"
                      }`}>Edit</span>
                    </div>
                  </div>
                )}

                <div className="p-1.5 space-y-1">

                  {/* ── CATEGORIES: grid row FIRST, then sections below ── */}
                  {currentLayoutKey === "categories" && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      <div
                        onClick={() => {
                          const key = "categories"
                          const existing = getPageSections(store, key)
                          if (!existing.find((s: any) => s.id === "__category_grid__")) {
                            patchStore(p => setPageSections(p, key, [
                              { id: "__category_grid__", type: "category_grid" as SectionType, title: "Categories", columns: 4 },
                              ...getPageSections(p, key),
                            ]))
                          }
                          setSelectedId("__category_grid__")
                          setRightPanelOpen(true)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          selectedId === "__category_grid__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                          <Layout className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                            Category Grid
                          </p>
                          <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          selectedId === "__category_grid__"
                            ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                            : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                      </div>
                      {bodySections.length === 0 ? (
                        <div className="py-3 text-center">
                          <p className={`text-[10px] ${textFaint} opacity-60`}>Add sections below the category grid</p>
                        </div>
                      ) : (
                        bodySections.map((s, i) => (
                          <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── COLLECTIONS: grid row FIRST (editable), then sections below ── */}
                  {/* // ADD this BEFORE the OTHER SYSTEM PAGES block: */}
                  {currentLayoutKey === "collection" && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      <div
                        onClick={() => {
                          const key = "collection"
                          const existing = getPageSections(store, key)
                          if (!existing.find((s: any) => s.id === "__collection_products__")) {
                            patchStore(p => setPageSections(p, key, [
                              ...getPageSections(p, key),
                              { id: "__collection_products__", type: "collection_products" as SectionType,
                                title: "Products", columns: 3 },
                            ]))
                          }
                          setSelectedId("__collection_products__")
                          setRightPanelOpen(true)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          selectedId === "__collection_products__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                          <Layout className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                            Collection Products
                          </p>
                          <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          selectedId === "__collection_products__"
                            ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                            : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                      </div>
                      {bodySections.length === 0 ? (
                        <div className="py-3 text-center">
                          <p className={`text-[10px] ${textFaint} opacity-60`}>
                            Add sections below the products
                          </p>
                        </div>
                      ) : (
                        bodySections.map((s, i) => (
                          <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── COLLECTIONS PAGE: sections first, editable Collections Grid row at bottom ── */}
                  {currentLayoutKey === "collections" && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      <div
                        onClick={() => {
                          const key = "collections"
                          const existing = getPageSections(store, key)
                          if (!existing.find((s: any) => s.id === "__collections_grid__")) {
                            patchStore(p => setPageSections(p, key, [
                              { id: "__collections_grid__", type: "collections_grid" as SectionType,
                                title: "Collections", columns: 3 },
                              ...getPageSections(p, key).filter((s: any) => s.id !== "__collections_grid__"),
                            ]))
                          }
                          setSelectedId("__collections_grid__")
                          setRightPanelOpen(true)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          selectedId === "__collections_grid__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                          <Layout className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                            Collections Grid
                          </p>
                          <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          selectedId === "__collections_grid__"
                            ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                            : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                      </div>
                      {bodySections.length === 0 ? (
                        <div className="py-3 text-center">
                          <p className={`text-[10px] ${textFaint} opacity-60`}>
                            Add sections below the collections grid
                          </p>
                        </div>
                      ) : (
                        bodySections.map((s, i) => (
                          <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── CATEGORY PAGE: sections first, editable Category Products row at bottom ── */}
                  {currentLayoutKey === "category" && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      {bodySections.length === 0 ? (
                        <div className="py-1 text-center">
                          <p className={`text-[10px] ${textFaint} opacity-60`}>Add sections below the products</p>
                        </div>
                      ) : (
                        bodySections.map((s, i) => (
                          <div key={s.id}>
                            <SectionRow s={s} idx={i} />
                            {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                          </div>
                        ))
                      )}
                      <div
                        onClick={() => {
                          const key = "category"
                          const existing = getPageSections(store, key)
                          if (!existing.find((s: any) => s.id === "__category_products__")) {
                            patchStore(p => setPageSections(p, key, [
                              ...getPageSections(p, key),
                              { id: "__category_products__", type: "category_products" as SectionType, title: "Products", columns: 3 },
                            ]))
                          }
                          setSelectedId("__category_products__")
                          setRightPanelOpen(true)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          selectedId === "__category_products__"
                            ? "bg-orange-500/15 border-orange-500/40"
                            : isDark ? "border-orange-800/40 bg-orange-900/20" : "border-orange-200/60 bg-orange-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-orange-500/20">
                          <Layout className="w-3 h-3 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-orange-300" : "text-orange-700"}`}>
                            Category Products
                          </p>
                          <p className={`text-[10px] ${textFaint}`}>Columns · Heading · Colors — click to edit</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                          selectedId === "__category_products__"
                            ? isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                            : isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-500"
                        }`}>Edit</span>
                      </div>
                    </div>
                  )}

                  {/* ── OTHER SYSTEM PAGES: sections first, plain Auto row at bottom ── */}
                  {!["categories", "collections", "category", "home"].includes(currentLayoutKey) &&
                    !currentLayoutKey.startsWith("page_") &&
                    ["products", "cart", "search", "product"].includes(currentLayoutKey) && (
                      <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                        {bodySections.length === 0 ? (
                          <div className="py-3 text-center">
                            <p className={`text-[10px] ${textFaint} opacity-60`}>
                              Add sections below the system content
                            </p>
                          </div>
                        ) : (
                          bodySections.map((s, i) => (
                            <div key={s.id}>
                              <SectionRow s={s} idx={i} />
                              {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                            </div>
                          ))
                        )}
                      </div>
                  )}

                  {/* ── HOME PAGE ── */}
                  {currentLayoutKey === "home" && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      {bodySections.length === 0 && (
                        <div className="py-6 space-y-1 text-center">
                          <p className={`text-xs font-medium ${textFaint}`}>No sections yet</p>
                          <p className={`text-[10px] ${textFaint} opacity-60`}>Click "+ Add section" to build this page</p>
                        </div>
                      )}
                      {bodySections.map((s, i) => (
                        <div key={s.id}>
                          <SectionRow s={s} idx={i} />
                          {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── CUSTOM PAGES (page_*) ── */}
                  {currentLayoutKey.startsWith("page_") && (
                    <div onDragOver={handleBodyDragOver} onDrop={handleBodyDrop}>
                      {bodySections.length === 0 && (
                        <div className="py-6 space-y-1 text-center">
                          <p className={`text-xs font-medium ${textFaint}`}>No sections yet</p>
                          <p className={`text-[10px] ${textFaint} opacity-60`}>
                            Click "+ Add section" to build this page
                          </p>
                        </div>
                      )}
                      {bodySections.map((s, i) => (
                        <div key={s.id}>
                          <SectionRow s={s} idx={i} />
                          {i < bodySections.length - 1 && <AddBetweenLine afterIndex={i} />}
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                <div className="px-1.5 pb-1.5">
                  <AddBetweenButton afterIndex={bodySections.length - 1} zone="body-end" />
                </div>
              </div>

              {/* ── FOOTER ZONE ── */}
              <ZoneLabel label="Footer" color="#0ea5e9" />
              <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <div className="p-1.5 space-y-1">
                  {/* Editable footer sections if any */}
                  {footerSections.filter(s => s.type !== "footer").map((s, i) => <SectionRow key={s.id} s={s} idx={i} />)}
                  {/* Locked Store Footer row — always at bottom */}
                  {(() => {
                    const footerSec = homeSections.find(s => s.type === "footer")
                    const isFooterSelected = selectedId === (footerSec?.id ?? "__store_footer__")
                    return (
                      <div
                        onClick={() => {
                          const currentSections = store.sections?.sections ?? []

                          const defaultFooterColumns: FooterColumn[] = getDefaultFooterColumns(
                            vendorCollections, vendorCategories, pages, store
                          )

                          let fSec = currentSections.find((s: any) => s.type === "footer")

                          if (!fSec) {
                            const newId = `s_footer_${Date.now()}`
                            fSec = {
                              id: newId,
                              type: "footer" as SectionType,
                              show_newsletter: false,
                              footer_columns: defaultFooterColumns,
                            }
                            patchStore(p => ({
                              ...p,
                              sections: {
                                ...p.sections,
                                sections: [...(p.sections?.sections ?? []), fSec],
                              }
                            }))
                          } else {
                            // Deduplicate existing columns first (remove any duplicate headings keeping last)
                            const seenHeadings = new Set<string>()
                            const deduped = [...(fSec.footer_columns ?? [])].reverse().filter(c => {
                              const key = c.heading.toLowerCase().trim()
                              if (seenHeadings.has(key)) return false
                              seenHeadings.add(key)
                              return true
                            }).reverse()

                            // Find default columns missing from saved data
                            const existingHeadings = deduped.map((c: FooterColumn) => c.heading.toLowerCase().trim())
                            const missingCols = defaultFooterColumns.filter(
                              dc => !existingHeadings.includes(dc.heading.toLowerCase().trim())
                            )

                            const needsUpdate = deduped.length !== (fSec.footer_columns ?? []).length || missingCols.length > 0

                            if (needsUpdate) {
                              fSec = {
                                ...fSec,
                                footer_columns: [...deduped, ...missingCols],
                              }
                              patchStore(p => ({
                                ...p,
                                sections: {
                                  ...p.sections,
                                  sections: (p.sections?.sections ?? []).map((s: any) =>
                                    s.id === fSec!.id ? fSec! : s
                                  ),
                                }
                              }))
                            }
                          }

                          setSelectedId(fSec.id)
                          setRightPanelOpen(true)
                          if (window.innerWidth < 768) setLeftPanelOpen(false)
                        }}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                          isFooterSelected
                            ? "bg-sky-500/15 border-sky-500/40"
                            : `${isDark ? "border-sky-800/40 bg-sky-900/20 hover:border-sky-600/50" : "border-sky-200/60 bg-sky-50/50 hover:border-sky-400/60"}`
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 bg-sky-500/20">
                          <Layout className="w-3 h-3 text-sky-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isDark ? "text-sky-300" : "text-sky-700"}`}>Store Footer</p>
                          <p className={`text-[10px] ${textFaint}`}>Links • Social • Copyright</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                          isFooterSelected
                            ? isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-600"
                            : isDark ? "bg-sky-900/50 text-sky-400" : "bg-sky-100 text-sky-500"
                        }`}>
                          {isFooterSelected ? "Edit" : "Auto"}
                        </span>
                      </div>
                    )
                  })()}
                </div>
              </div>

            </div>
          )
        })()}

        {/* ══ STYLE TAB ═══════════════════════════════════════════════ */}
        {activeTab === "style" && (
          <div className="p-3 space-y-3">
            <StyleSection title="Logo & Favicon" isDark={isDark}>
              <div className="space-y-3">
                <div>
                  <p className={`text-[10px] ${textFaint} mb-2`}>Store logo</p>
                  <div className="flex items-center gap-2">
                    <div onClick={() => fileLogoRef.current?.click()}
                      className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                      {store.store_logo ? <img src={store.store_logo} alt="logo" className="object-contain w-full h-full p-1" /> : <ImageIcon className={`w-5 h-5 ${textFaint}`} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <button onClick={() => fileLogoRef.current?.click()} disabled={isUploadingLogo}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                        {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{store.store_logo ? "Change" : "Upload"}
                      </button>
                      {store.store_logo && (
                        <button onClick={() => setStore(p => ({ ...p, store_logo: undefined }))}
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-red-900 text-[10px] text-red-400 hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-2.5 h-2.5" />Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input ref={fileLogoRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => { if (e.target.files?.[0]) { setIsUploadingLogo(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, store_logo: url })); setIsUploadingLogo(false) } }} />
                </div>
                <div>
                  <p className={`text-[10px] ${textFaint} mb-2`}>Favicon <span className="opacity-60">(browser tab icon)</span></p>
                  <div className="flex items-center gap-2">
                    <div onClick={() => fileFavRef.current?.click()}
                      className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors shrink-0 ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}>
                      {store.store_favicon ? <img src={store.store_favicon} alt="fav" className="object-contain w-full h-full" /> : <Globe className={`w-4 h-4 ${textFaint}`} />}
                    </div>
                    <button onClick={() => fileFavRef.current?.click()} disabled={isUploadingFav}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:border-gray-500" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}>
                      {isUploadingFav ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}{store.store_favicon ? "Change" : "Upload"}
                    </button>
                    {store.store_favicon && (
                      <button onClick={() => setStore(p => ({ ...p, store_favicon: undefined }))} className="p-1.5 rounded border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                  <input ref={fileFavRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => { if (e.target.files?.[0]) { setIsUploadingFav(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, store_favicon: url })); setIsUploadingFav(false) } }} />
                </div>
              </div>
            </StyleSection>

            <StyleSection title="Colors" isDark={isDark}>
              <div className="space-y-2.5">
                {[
                  { key: "primary_color",   label: "Primary",   hint: "Buttons & links", default: "#e65100" },
                  { key: "secondary_color", label: "Secondary", hint: "Gradients",        default: "#ac1900" },
                  // { key: "accent_color",    label: "Accent",    hint: "Highlights",       default: "#f97316" },
                ].map(({ key, label, hint, default: def }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`text-[10px] ${textFaint}`}>{label}</label>
                      <span className={`text-[10px] ${textFaint} opacity-60`}>{hint}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={(store as any)[key] ?? def}
                        onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                        className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                      <input type="text"
                        value={(store as any)[key] ?? def}
                        onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${inputCls}`} />
                    </div>
                  </div>
                ))}
                {/* Gradient preview — static, no click */}
                {/* <div className="h-8 overflow-hidden rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${store.primary_color ?? "#e65100"}, ${store.secondary_color ?? "#ac1900"})` }} /> */}
              </div>
            </StyleSection>

            <StyleSection title="Typography" isDark={isDark}>
              <div className="space-y-1.5">
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setStore(p => ({ ...p, font: f.id }))}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${store.font === f.id ? "border-orange-500/50 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}`}>
                    <span className={`text-xs ${textPrimary}`}>{f.name}</span>
                    {store.font === f.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  </button>
                ))}
              </div>
            </StyleSection>

            <StyleSection title="Social Links" isDark={isDark}>
              <div className="space-y-2">
                <p className={`text-[10px] ${textFaint} opacity-70 mb-2`}>These appear in your header and footer when enabled.</p>
                {[
                  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/yourhandle", color: "#E1306C" },
                  { key: "youtube_url",   label: "YouTube",   placeholder: "https://youtube.com/@yourchannel", color: "#FF0000" },
                  { key: "twitter_url",   label: "X",         placeholder: "https://x.com/yourhandle",         color: "#1DA1F2" },
                  { key: "facebook_url",  label: "Facebook",  placeholder: "https://facebook.com/yourpage",    color: "#1877F2" },
                  // { key: "tiktok_url",    label: "TikTok",    placeholder: "https://tiktok.com/@yourhandle",   color: "#000000" },
                  // { key: "discord_url",   label: "Discord",   placeholder: "https://discord.gg/yourserver",    color: "#5865F2" },
                ].map(({ key, label, placeholder, color }) => (
                  <div key={key}>
                    <label className={`text-[10px] ${textFaint} flex items-center gap-1 mb-1`}>
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />{label}
                    </label>
                    <input value={(store as any)[key] ?? ""} onChange={e => setStore(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className={`w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 ${inputCls}`} />
                  </div>
                ))}
              </div>
            </StyleSection>

            <StyleSection title="Product Cards" isDark={isDark}>
              <div className="space-y-3">
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1.5`}>Image aspect ratio</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["square", "portrait", "landscape"] as const).map(ratio => (
                      <button key={ratio} onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, aspect_ratio: ratio } }))}
                        className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${store.product_card?.aspect_ratio === ratio || (!store.product_card?.aspect_ratio && ratio === "square") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1.5`}>Alignment</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["left", "center"] as const).map(align => (
                      <button key={align} onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, alignment: align } }))}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[10px] capitalize transition-all ${store.product_card?.alignment === align || (!store.product_card?.alignment && align === "left") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                        {align === "left" ? <AlignLeft className="w-3 h-3" /> : <AlignCenter className="w-3 h-3" />}{align}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "show_price", label: "Show price", default: true },
                    { key: "show_hover", label: "Hover zoom effect", default: true },
                    { key: "show_sold_out_badge", label: "Show sold-out badge", default: true },
                  ].map(({ key, label, default: def }) => {
                    const val = (store.product_card as any)?.[key] !== undefined ? (store.product_card as any)[key] : def
                    return (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative shrink-0" onClick={() => setStore(p => ({ ...p, product_card: { ...p.product_card, [key]: !val } }))}>
                          <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                        </div>
                        <span className={`text-xs ${textPrimary}`}>{label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </StyleSection>

            {/* <StyleSection title="Buttons & Shapes" isDark={isDark}>
              <div className="space-y-3">
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1.5`}>Button style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["filled", "outline", "ghost"] as const).map(style => (
                      <button key={style} onClick={() => setStore(p => ({ ...p, button_style: style }))}
                        className={`py-2 rounded-lg border text-[10px] capitalize transition-all ${store.button_style === style || (!store.button_style && style === "filled") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1.5`}>Corner radius</label>
                  <div className="grid grid-cols-5 gap-1">
                    {(["none", "sm", "md", "lg", "full"] as const).map((r, i) => (
                      <button key={r} onClick={() => setStore(p => ({ ...p, border_radius: r }))}
                        className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] transition-all ${store.border_radius === r || (!store.border_radius && r === "md") ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"}`}`}>
                        <div className="w-3.5 h-3.5 border border-current" style={{ borderRadius: ["0","2px","4px","8px","50%"][i] }} />
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StyleSection> */}

            <StyleSection title="Header Behaviour" isDark={isDark}>
              <div className="space-y-2.5">
                {[
                  { key: "sticky_header", label: "Sticky header", hint: "Stays fixed while scrolling", def: true },
                  { key: "sticky_announcement", label: "Sticky announcement bar", hint: "Bar stays at top", def: true },
                ].map(({ key, label, hint, def }) => {
                  const val = (store as any)[key] !== undefined ? (store as any)[key] : def
                  return (
                    <label key={key} className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${val ? "border-orange-500/40 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`}>
                      <div className="relative mt-0.5 shrink-0" onClick={() => setStore(p => ({ ...p, [key]: !val }))}>
                        <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${textPrimary}`}>{label}</p>
                        <p className={`text-[10px] mt-0.5 ${textFaint}`}>{hint}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </StyleSection>

            <StyleSection title="SEO & Social Sharing" isDark={isDark}>
              <div className="space-y-2.5">
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
                  <EditorInput value={store.seo_title ?? ""} onChange={v => setStore(p => ({ ...p, seo_title: v }))} placeholder={`${vendorHandle} — Official Merch`} isDark={isDark} />
                  <p className={`text-[10px] mt-0.5 ${store.seo_title && store.seo_title.length > 55 ? "text-amber-400" : textFaint}`}>{(store.seo_title ?? "").length}/60</p>
                </div>
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1`}>Meta description</label>
                  <EditorTextarea value={store.seo_description ?? ""} onChange={v => setStore(p => ({ ...p, seo_description: v }))} placeholder="Shop official merch from..." rows={3} isDark={isDark} />
                  <p className={`text-[10px] mt-0.5 ${store.seo_description && store.seo_description.length > 150 ? "text-amber-400" : textFaint}`}>{(store.seo_description ?? "").length}/160</p>
                </div>
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1`}>Social share image (OG Image)</label>
                  <div className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${isDark ? "border-gray-700 bg-gray-800 hover:border-gray-500" : "border-gray-300 bg-gray-50 hover:border-gray-400"}`}
                    onClick={() => fileOgRef.current?.click()}>
                    {store.og_image
                      ? <img src={store.og_image} alt="og" className="object-cover w-full h-full" />
                      : <div className="text-center"><ImageIcon className={`w-5 h-5 mx-auto mb-1 ${textFaint}`} /><p className={`text-[10px] ${textFaint}`}>1200×630px recommended</p></div>}
                  </div>
                  <input ref={fileOgRef} type="file" accept="image/*" className="hidden"
                    onChange={async e => { if (e.target.files?.[0]) { setIsUploadingOg(true); const url = await uploadFile(e.target.files[0]); if (url) setStore(p => ({ ...p, og_image: url })); setIsUploadingOg(false) } }} />
                </div>
              </div>
            </StyleSection>

            <StyleSection title="Custom CSS" isDark={isDark}>
              <div>
                <p className={`text-[10px] ${textFaint} mb-2 opacity-70`}>Advanced: inject CSS directly into your store. Use with care.</p>
                <EditorTextarea value={store.custom_css ?? ""} onChange={v => setStore(p => ({ ...p, custom_css: v }))}
                  placeholder={"/* Add your CSS here */\n.hero-section { background: ... }"} rows={6} isDark={isDark} mono />
              </div>
            </StyleSection>

            <StyleSection title="Domain" isDark={isDark}>
              <div className="space-y-2.5">
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1`}>Subdomain</label>
                  <div className="flex items-center">
                    <input value={store.subdomain ?? vendorHandle} onChange={e => setStore(p => ({ ...p, subdomain: e.target.value }))} className={`flex-1 rounded-l-lg px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 border-r-0 ${inputCls}`} />
                    <span className={`px-2 py-1.5 text-[10px] rounded-r-lg border ${isDark ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500"} whitespace-nowrap`}>.junooni.com</span>
                  </div>
                </div>
                <div>
                  <label className={`text-[10px] ${textFaint} block mb-1`}>Custom domain <span className="opacity-60">(optional)</span></label>
                  <EditorInput value={store.custom_domain ?? ""} onChange={v => setStore(p => ({ ...p, custom_domain: v || undefined }))} placeholder="merch.yourname.com" isDark={isDark} />
                  {store.domain_verified && <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><Check className="w-2.5 h-2.5" />Domain verified</p>}
                </div>
              </div>
            </StyleSection>
          </div>
        )}

        {/* ══ PAGES TAB ═══════════════════════════════════════════════ */}
        {activeTab === "pages" && (
          <div className="p-2">
            {editingPage ? (
              <PageEditorPanel page={editingPage} vendorHandle={vendorHandle}
                onSave={savePage} onCancel={() => setEditingPage(null)}
                onDelete={() => { deletePage(editingPage.id); setEditingPage(null) }}
                isNew={!pages.find(p => p.id === editingPage.id)} isDark={isDark}
                onDraftChange={(updated) => {
                  patchStore(p => {
                    const existing = p.pages?.pages ?? []
                    const updatedPages = existing.find(pg => pg.id === updated.id)
                      ? existing.map(pg => pg.id === updated.id ? updated : pg)
                      : [...existing, updated]
                    return { ...p, pages: { pages: updatedPages } }
                  })
                  setHasUnsavedChanges(true)
                }} />
            ) : (
              <>
                <p className={`text-[10px] uppercase tracking-wider px-1 py-2 ${textFaint}`}>Custom pages</p>
                {pages.map(page => (
                  <div key={page.id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg}`}>
                    <span className="text-sm shrink-0">{PAGE_TEMPLATES.find(t => t.id === page.template)?.icon ?? "📄"}</span>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingPage(page)}>
                      <p className={`text-xs font-medium truncate ${textPrimary}`}>{page.title}</p>
                      <p className={`text-[10px] font-mono ${textFaint}`}>/pages/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                      {page.in_nav && <span className="text-[9px] px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">Nav</span>}
                      {page.in_footer && <span className="text-[9px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">Footer</span>}
                      <button onClick={() => setEditingPage(page)} className="p-0.5 rounded hover:bg-gray-700"><Pencil className={`w-2.5 h-2.5 ${textMuted}`} /></button>
                      <button onClick={() => deletePage(page.id)} className="p-0.5 rounded hover:bg-red-900/50"><Trash2 className="w-2.5 h-2.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && <p className={`px-2 py-2 text-xs ${textFaint}`}>No custom pages yet.</p>}
                <p className={`text-[10px] uppercase tracking-wider px-1 py-2 mt-2 border-t ${panelBorder} ${textFaint}`}>Create new page</p>
                {PAGE_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => startNewPage(t.id)}
                    className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all border border-transparent ${hoverBg} text-left`}>
                    <span className="text-sm">{t.icon}</span>
                    <span className={`text-xs ${textPrimary}`}>{t.label}</span>
                    <Plus className={`w-3 h-3 ml-auto ${textFaint}`} />
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══ THEME TAB ═══════════════════════════════════════════════ */}
        {activeTab === "theme" && (
          <div className="p-3 space-y-3">
            <p className={`text-[10px] uppercase tracking-wider ${textFaint}`}>Template</p>
            <div className="space-y-2">
              {TEMPLATES.map(t => {
                const brandPrimary = store.primary_color ?? "#e65100"
                const isSelected = store.template === t.id || (!store.template && t.id === "minimal")
                return (
                  <button key={t.id} onClick={() => setStore(p => ({ ...p, template: t.id }))}
                    className={`w-full text-left rounded-xl border transition-all overflow-hidden ${
                      isSelected
                        ? "border-orange-500/60 ring-1 ring-orange-500/30"
                        : isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-gray-400"
                    }`}>

                    {/* ── Mini store preview — Minimal ── */}
                    {t.id === "minimal" && (
                      <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        {/* bg */}
                        <rect width="220" height="130" fill="#ffffff"/>
                        {/* header */}
                        <rect width="220" height="18" fill="#ffffff"/>
                        <rect x="8" y="6" width="28" height="6" rx="2" fill={brandPrimary}/>
                        <rect x="140" y="6" width="20" height="6" rx="2" fill="#e5e7eb"/>
                        <rect x="164" y="6" width="20" height="6" rx="2" fill="#e5e7eb"/>
                        <rect x="188" y="6" width="20" height="6" rx="2" fill="#e5e7eb"/>
                        <line x1="0" y1="18" x2="220" y2="18" stroke="#f3f4f6" strokeWidth="1"/>
                        {/* hero */}
                        <rect x="0" y="18" width="220" height="52" fill="#f9fafb"/>
                        <rect x="12" y="27" width="60" height="8" rx="2" fill="#1f2937"/>
                        <rect x="12" y="39" width="45" height="5" rx="1.5" fill="#9ca3af"/>
                        <rect x="12" y="49" width="26" height="9" rx="4.5" fill={brandPrimary}/>
                        <rect x="42" y="49" width="22" height="9" rx="4.5" fill="none" stroke="#d1d5db" strokeWidth="1"/>
                        <rect x="148" y="22" width="60" height="44" rx="6" fill="#e5e7eb"/>
                        {/* product grid */}
                        <rect x="0" y="74" width="220" height="2" fill="#f3f4f6"/>
                        <rect x="8" y="80" width="48" height="42" rx="3" fill="#f3f4f6"/>
                        <rect x="60" y="80" width="48" height="42" rx="3" fill="#f3f4f6"/>
                        <rect x="112" y="80" width="48" height="42" rx="3" fill="#f3f4f6"/>
                        <rect x="164" y="80" width="48" height="42" rx="3" fill="#f3f4f6"/>
                        <rect x="8" y="125" width="28" height="4" rx="1" fill="#e5e7eb"/>
                        <rect x="60" y="125" width="28" height="4" rx="1" fill="#e5e7eb"/>
                      </svg>
                    )}

                    {/* ── Mini store preview — Bold ── */}
                    {t.id === "bold" && (
                      <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        {/* dark bg */}
                        <rect width="220" height="130" fill="#0a0a0a"/>
                        {/* header */}
                        <rect width="220" height="18" fill="#111111"/>
                        <rect x="8" y="6" width="32" height="6" rx="2" fill="#ffffff"/>
                        <rect x="150" y="6" width="16" height="6" rx="2" fill="#374151"/>
                        <rect x="170" y="6" width="16" height="6" rx="2" fill="#374151"/>
                        <rect x="190" y="6" width="16" height="6" rx="2" fill="#374151"/>
                        {/* hero full-width dark */}
                        <rect x="0" y="18" width="220" height="68" fill="#111111"/>
                        <rect x="0" y="18" width="220" height="68" fill="url(#boldGrad)" opacity="0.4"/>
                        <defs>
                          <linearGradient id="boldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={brandPrimary} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.8"/>
                          </linearGradient>
                        </defs>
                        <rect x="12" y="30" width="72" height="10" rx="2" fill="#ffffff"/>
                        <rect x="12" y="44" width="52" height="6" rx="2" fill="#6b7280"/>
                        <rect x="12" y="56" width="30" height="12" rx="6" fill={brandPrimary}/>
                        {/* product strip dark */}
                        <rect x="0" y="90" width="220" height="40" fill="#111111"/>
                        <rect x="8" y="96" width="46" height="28" rx="3" fill="#1f1f1f"/>
                        <rect x="58" y="96" width="46" height="28" rx="3" fill="#1f1f1f"/>
                        <rect x="108" y="96" width="46" height="28" rx="3" fill="#1f1f1f"/>
                        <rect x="158" y="96" width="54" height="28" rx="3" fill="#1f1f1f"/>
                        <rect x="8" y="120" width="24" height="3" rx="1" fill="#374151"/>
                        <rect x="58" y="120" width="24" height="3" rx="1" fill="#374151"/>
                      </svg>
                    )}

                    {/* ── Mini store preview — Editorial ── */}
                    {t.id === "editorial" && (
                      <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        {/* cream bg */}
                        <rect width="220" height="130" fill="#faf9f7"/>
                        {/* header serif-style */}
                        <rect width="220" height="20" fill="#faf9f7"/>
                        <rect x="80" y="7" width="60" height="6" rx="1" fill="#1c1c1c"/>
                        <rect x="8" y="8" width="14" height="4" rx="1" fill="#9ca3af"/>
                        <rect x="26" y="8" width="14" height="4" rx="1" fill="#9ca3af"/>
                        <rect x="196" y="8" width="16" height="4" rx="1" fill="#9ca3af"/>
                        <line x1="0" y1="20" x2="220" y2="20" stroke="#e7e5e0" strokeWidth="1"/>
                        {/* big editorial hero - split layout */}
                        <rect x="0" y="20" width="110" height="70" fill="#e7e5e0"/>
                        <rect x="116" y="28" width="96" height="8" rx="1" fill="#1c1c1c"/>
                        <rect x="116" y="40" width="80" height="5" rx="1" fill="#9ca3af"/>
                        <rect x="116" y="48" width="88" height="5" rx="1" fill="#9ca3af"/>
                        <rect x="116" y="56" width="72" height="5" rx="1" fill="#9ca3af"/>
                        <rect x="116" y="68" width="34" height="10" rx="5" fill={brandPrimary}/>
                        {/* bottom editorial grid - big + small */}
                        <line x1="0" y1="92" x2="220" y2="92" stroke="#e7e5e0" strokeWidth="1"/>
                        <rect x="8" y="98" width="68" height="26" rx="2" fill="#e7e5e0"/>
                        <rect x="82" y="98" width="44" height="26" rx="2" fill="#e7e5e0"/>
                        <rect x="132" y="98" width="38" height="26" rx="2" fill="#e7e5e0"/>
                        <rect x="176" y="98" width="38" height="26" rx="2" fill="#e7e5e0"/>
                        <rect x="8" y="126" width="36" height="3" rx="1" fill="#9ca3af"/>
                      </svg>
                    )}

                    {/* Card footer */}
                    <div className={`flex items-center justify-between px-3 py-2 ${
                      t.id === "bold"
                        ? "bg-gray-900"
                        : t.id === "editorial"
                          ? "bg-stone-100"
                          : isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}>
                      <div>
                        <p className={`text-xs font-semibold ${
                          t.id === "bold" ? "text-white" : t.id === "editorial" ? "text-stone-800" : textPrimary
                        }`}>{t.name}</p>
                        <p className={`text-[10px] ${
                          t.id === "bold" ? "text-gray-500" : t.id === "editorial" ? "text-stone-500" : textFaint
                        }`}>{t.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className={`pt-3 border-t ${panelBorder} space-y-2`}>
              <p className={`text-[10px] uppercase tracking-wider ${textFaint}`}>Store identity</p>
              <div>
                <label className={`text-[10px] ${textFaint} block mb-1`}>Tagline</label>
                <EditorInput value={store.tagline ?? ""} onChange={v => setStore(p => ({ ...p, tagline: v }))} placeholder="Official merch store" isDark={isDark} />
              </div>
              <div>
                <label className={`text-[10px] ${textFaint} block mb-1`}>Hero background image URL</label>
                <EditorInput value={store.hero_image ?? ""} onChange={v => setStore(p => ({ ...p, hero_image: v || undefined }))} placeholder="https://..." isDark={isDark} />
                {store.hero_image && <img src={store.hero_image} alt="hero" className="object-cover w-full h-16 mt-2 rounded-lg opacity-60" />}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )

  const isProductDetailPanel      = selectedId === "__product_detail__"
  const isCategoryGridPanel       = selectedId === "__category_grid__"
  const isCategoryProductsPanel   = selectedId === "__category_products__"
  const isCollectionsGridPanel    = selectedId === "__collections_grid__"
  const isCollectionProductsPanel = selectedId === "__collection_products__"
  const isSystemPanel = selectedId?.endsWith("_system__") ?? false
  const isVirtualPanel = isProductDetailPanel || isCategoryGridPanel || isCategoryProductsPanel || isCollectionsGridPanel || isCollectionProductsPanel || isSystemPanel

  // Get the virtual section data for grid/products panels:
  const categoryGridSection     = isCategoryGridPanel
    ? (getPageSections(store, "categories").find((s: any) => s.id === "__category_grid__") ?? { id: "__category_grid__", type: "category_grid", title: "Categories", columns: 4 })
    : null
    // Add collections grid section data:
  const collectionsGridSection = isCollectionsGridPanel
    ? (getPageSections(store, "collections").find((s: any) => s.id === "__collections_grid__") 
      ?? { id: "__collections_grid__", type: "collections_grid", title: "Collections", columns: 3 })
    : null
  const categoryProductsSection = isCategoryProductsPanel
    ? (getPageSections(store, "category").find((s: any) => s.id === "__category_products__") ?? { id: "__category_products__", type: "category_products", title: "Products", columns: 3 })
    : null
  const collectionProductsSection = isCollectionProductsPanel
    ? (getPageSections(store, "collection").find((s: any) => s.id === "__collection_products__")
      ?? { id: "__collection_products__", type: "collection_products", title: "Products", columns: 3 })
    : null

const RightPanelContent = (isVirtualPanel || selectedSection) ? (
  <>
    <div className="flex justify-center pt-2 pb-1 md:hidden shrink-0">
      <div className="w-10 h-1 bg-gray-600 rounded-full" />
    </div>

    {/* ── Header ── */}
    <div className={`flex items-center justify-between px-3 py-2.5 border-b shrink-0 ${panelBorder}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded-md"
          style={
            isProductDetailPanel      ? { background: "#ec489920", color: "#ec4899" } :
            isCategoryGridPanel       ? { background: "#f59e0b20", color: "#f59e0b" } :
            isCategoryProductsPanel   ? { background: "#f59e0b20", color: "#f59e0b" } :
            isCollectionsGridPanel    ? { background: "#f59e0b20", color: "#f59e0b" } :
            isCollectionProductsPanel ? { background: "#f59e0b20", color: "#f59e0b" } :
            {
              background: `${SECTION_BLOCKS.find(b => b.type === selectedSection?.type)?.color ?? "#666"}20`,
              color: SECTION_BLOCKS.find(b => b.type === selectedSection?.type)?.color ?? "#666"
            }
          }>
         {isProductDetailPanel
            ? <ShoppingBag className="w-3 h-3" />
            : (isCategoryGridPanel || isCategoryProductsPanel || isCollectionsGridPanel || isCollectionProductsPanel)
              ? <Layout className="w-3 h-3" />
              : selectedSection?.type === "header"
                ? <Menu className="w-3 h-3" />
                : SECTION_BLOCKS.find(b => b.type === selectedSection?.type)?.icon
          }
        </div>
       <span className={`text-sm font-semibold ${textPrimary}`}>
          {isProductDetailPanel      ? "Product Detail" :
          isCategoryGridPanel       ? "Category Grid" :
          isCategoryProductsPanel   ? "Category Products" :
          isCollectionsGridPanel    ? "Collections Grid" :
          isCollectionProductsPanel ? "Collection Products" :
          selectedSection?.type === "header" ? "Store Header" :
          SECTION_BLOCKS.find(b => b.type === selectedSection?.type)?.label ?? selectedSection?.type}
        </span>
      </div>
      <button
        onClick={() => { setSelectedId(null); setRightPanelOpen(false) }}
        className={`p-1 ${textFaint} transition-colors`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* ── Body ── */}
    <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto overscroll-contain">
      {isProductDetailPanel ? (
        <ProductDetailSettings
          settings={store.product_detail ?? {}}
          onChange={patch =>
            patchStore(p => ({
              ...p,
              product_detail: { ...(p.product_detail ?? {}), ...patch },
            }))
          }
          isDark={isDark}
        />
      ) : isCategoryGridPanel && categoryGridSection ? (
        <SectionSettings
          section={categoryGridSection as any}
          onChange={patch => {
            const key = "categories"
            const existing = getPageSections(store, key)
            const updated = existing.find((s: any) => s.id === "__category_grid__")
              ? existing.map((s: any) => s.id === "__category_grid__" ? { ...s, ...patch } : s)
              : [{ id: "__category_grid__", type: "category_grid", ...patch }, ...existing]
            patchStore(p => setPageSections(p, key, updated))
          }}
          token={token ?? ""}
          backendUrl={backendUrl}
          isDark={isDark}
          collections={vendorCollections}
          categories={vendorCategories}
          pages={pages}
          storeLogo={store.store_logo ?? ""}
          products={vendorProducts}
          vendorHandle={vendorHandle}
          currentLayoutKey="categories"
        />
      ) : isCategoryProductsPanel && categoryProductsSection ? (
        <SectionSettings
          section={categoryProductsSection as any}
          onChange={patch => {
            const key = "category"
            const existing = getPageSections(store, key)
            const updated = existing.find((s: any) => s.id === "__category_products__")
              ? existing.map((s: any) => s.id === "__category_products__" ? { ...s, ...patch } : s)
              : [...existing, { id: "__category_products__", type: "category_products", ...patch }]
            patchStore(p => setPageSections(p, key, updated))
          }}
          token={token ?? ""}
          backendUrl={backendUrl}
          isDark={isDark}
          collections={vendorCollections}
          categories={vendorCategories}
          pages={pages}
          storeLogo={store.store_logo ?? ""}
          products={vendorProducts}
          vendorHandle={vendorHandle}
          currentLayoutKey="category"
        />
      ) : isCollectionsGridPanel && collectionsGridSection ? (
        <SectionSettings
          section={collectionsGridSection as any}
          onChange={patch => {
            const key = "collections"
            const existing = getPageSections(store, key)
            const updated = existing.find((s: any) => s.id === "__collections_grid__")
              ? existing.map((s: any) => s.id === "__collections_grid__" ? { ...s, ...patch } : s)
              : [{ id: "__collections_grid__", type: "collections_grid", ...patch }, ...existing]
            patchStore(p => setPageSections(p, key, updated))
          }}
          token={token ?? ""}
          backendUrl={backendUrl}
          isDark={isDark}
          collections={vendorCollections}
          categories={vendorCategories}
          pages={pages}
          storeLogo={store.store_logo ?? ""}
          products={vendorProducts}
          vendorHandle={vendorHandle}
          currentLayoutKey="collections"
        />
      ) : isCollectionProductsPanel && collectionProductsSection ? (
        <SectionSettings
          section={collectionProductsSection as any}
          onChange={patch => {
            const key = "collection"
            const existing = getPageSections(store, key)
            const updated = existing.find((s: any) => s.id === "__collection_products__")
              ? existing.map((s: any) => s.id === "__collection_products__" ? { ...s, ...patch } : s)
              : [...existing, { id: "__collection_products__", type: "collection_products", ...patch }]
            patchStore(p => setPageSections(p, key, updated))
          }}
          token={token ?? ""}
          backendUrl={backendUrl}
          isDark={isDark}
          collections={vendorCollections}
          categories={vendorCategories}
          pages={pages}
          storeLogo={store.store_logo ?? ""}
          products={vendorProducts}
          vendorHandle={vendorHandle}
          currentLayoutKey="collection"
        />
        ) : isSystemPanel ? (
        <div className="py-8 space-y-2 text-center">
          <Layout className={`w-8 h-8 mx-auto ${textFaint} opacity-40`} />
          <p className={`text-sm font-medium ${textPrimary}`}>
            {currentLayoutKey === "search"   ? "Search Bar & Results" :
            currentLayoutKey === "cart"     ? "Cart Items & Checkout" :
            currentLayoutKey === "products" ? "Product Grid" :
            "System Content"}
          </p>
          <p className={`text-xs ${textFaint} opacity-70 max-w-[200px] mx-auto leading-relaxed`}>
            This section is rendered automatically by the system and cannot be edited.
          </p>
        </div>
      ) : selectedSection ? (
         <SectionSettings
          section={selectedSection}
          onChange={patch => updateSection(selectedSection.id, patch)}
          token={token ?? ""}
          backendUrl={backendUrl}
          isDark={isDark}
          collections={vendorCollections}
          categories={vendorCategories}
          pages={pages}
          storeLogo={store.store_logo ?? ""}
          products={vendorProducts}
          vendorHandle={vendorHandle}
          currentLayoutKey={currentLayoutKey}
        />
      ) : null}
    </div>

    {/* ── Footer actions — only for regular sections, not product detail ── */}
    {!isVirtualPanel && selectedSection && (
      <div className={`border-t ${panelBorder} px-3 py-2 flex gap-1.5 shrink-0`}>
        <button
          onClick={() => moveSection(selectedSection.id, "up")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                   : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
        >
          <ChevronUp className="w-3 h-3" />Up
        </button>
        <button
          onClick={() => moveSection(selectedSection.id, "down")}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                   : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
        >
          <ChevronDown className="w-3 h-3" />Down
        </button>
        <button
          onClick={() => duplicateSection(selectedSection.id)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
            isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                   : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={() => toggleSection(selectedSection.id)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
            isDark ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                   : "border-gray-200 text-gray-500 hover:border-gray-400"
          }`}
          title={selectedSection.hidden ? "Show section" : "Hide section"}
        >
          {selectedSection.hidden
            ? <EyeOff className="w-3 h-3" />
            : <Eye className="w-3 h-3" />
          }
        </button>
        <button
          onClick={() => removeSection(selectedSection.id)}
          className="px-2.5 py-1.5 rounded-lg border border-red-900 text-red-400 hover:bg-red-900/30 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    )}
  </>
) : null

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
      <style>{`
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sectionFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>
      {/* ── TOP BAR ── */}
      <div className={`flex items-center justify-between px-3 py-2 border-b shrink-0 z-20 ${panelBg} ${panelBorder}`}>
       <div className="flex items-center min-w-0 gap-2">
          {/* Mobile: open/close drawer */}
          <button
            className={`md:hidden p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}
            onClick={() => setLeftPanelOpen(o => !o)}
            aria-label="Toggle editor panel"
          >
            <Menu className="w-4 h-4" />
          </button>
          {/* Desktop: collapse/expand sidebar */}
          <button
            className={`hidden md:flex items-center justify-center p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
            onClick={() => setLeftPanelCollapsed(c => !c)}
            aria-label="Toggle sidebar"
            title={leftPanelCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {leftPanelCollapsed
              ? <Menu className="w-4 h-4" />
              : <PanelLeftClose className="w-4 h-4" />
            }
          </button>
          <Link to="/store" className={`flex items-center gap-1 text-xs ${textMuted} transition-colors shrink-0`}>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
          <span className={`text-sm font-semibold ${textPrimary} hidden sm:inline`}>Store Editor</span>
        </div>
        {/* ── Page Switcher + Viewport toggle (center) ── */}
        <div className="flex items-center gap-2">
          <PageSwitcherDropdown
            currentPath={previewPagePath}
            onSelect={path => { setPreviewPagePath(path); setSelectedId(null); setRightPanelOpen(false) }}
            pages={pages}
            products={vendorProducts}
            collections={vendorCollections}
            categories={vendorCategories}
            isDark={isDark}
            panelBorder={panelBorder}
            textPrimary={textPrimary}
            textFaint={textFaint}
            hoverBg={hoverBg}
          />
          <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
            <button onClick={() => setViewport("desktop")} className={`p-1.5 rounded-md transition-colors ${viewport === "desktop" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}><Monitor className="w-3.5 h-3.5" /></button>
            <button onClick={() => setViewport("mobile")} className={`p-1.5 rounded-md transition-colors ${viewport === "mobile" ? (isDark ? "bg-gray-600 text-white" : "bg-white text-gray-900 shadow-sm") : textMuted}`}><Smartphone className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {vendorHandle && (
            <a href={getStoreUrl(vendorHandle, store.custom_domain)} target="_blank" rel="noopener noreferrer" className={`hidden sm:flex items-center gap-1 text-xs ${textMuted} px-2 py-1.5 rounded-lg border ${panelBorder} transition-colors`}>
              <ExternalLink className="w-3 h-3" />Visit
            </a>
          )}
          <button onClick={() => { setIframeReady(false); iframeRef.current?.contentWindow?.location.reload() }} className={`p-1.5 ${textMuted} transition-colors hidden sm:block`}><RefreshCw className="w-3.5 h-3.5" /></button>
          <button onClick={handleToggleStatus} disabled={isTogglingStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isLive ? "bg-green-500/15 border-green-500/40 text-green-400 hover:bg-green-500/25" : "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"}`}>
            {isTogglingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-gray-500"}`} />}
            {isLive ? "Live" : "Draft"}
          </button>
          <button onClick={() => setEditorTheme(t => t === "dark" ? "light" : "dark")} className={`p-1.5 rounded-md transition-colors ${isDark ? "text-yellow-400" : "text-gray-500"}`}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`gap-1 px-3 text-xs text-white h-7 transition-colors ${
              hasUnsavedChanges
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-500 cursor-default"
            }`}
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            <span className="hidden sm:inline">{hasUnsavedChanges ? "Save" : "Saved"}</span>
          </Button>
        </div>
      </div>

      {/* ── 3-PANEL BODY ── */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {leftPanelOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setLeftPanelOpen(false)} />}
        <div className={`flex flex-col border-r overflow-hidden ${panelBg} ${panelBorder} md:shrink-0 md:relative md:translate-x-0 md:z-auto md:shadow-none fixed top-0 bottom-0 left-0 z-40 w-72 transition-all duration-300 ${
          leftPanelOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${leftPanelCollapsed ? "md:w-0 md:border-r-0" : "md:w-64"}`}>
          <div className={`md:hidden flex items-center justify-between px-3 py-2.5 border-b ${panelBorder}`}>
            <span className={`text-sm font-semibold ${textPrimary}`}>Editor</span>
            <button onClick={() => setLeftPanelOpen(false)} className={`p-1 rounded-lg ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}><X className="w-4 h-4" /></button>
          </div>
          {!leftPanelCollapsed && LeftPanelContent}
        </div>

        {/* ── CENTER PREVIEW ── */}
        <div className={`relative flex flex-col items-center flex-1 min-w-0 min-h-0 overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
          {/* <div className="w-full flex items-center justify-between px-3 py-1.5 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono mx-auto ${isDark ? "bg-gray-800/80 border-gray-700 text-gray-400" : "bg-white/80 border-gray-300 text-gray-500"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400" : "bg-yellow-400"}`} />
              <span className="truncate max-w-[180px] sm:max-w-none">
                {vendorHandle}.junooni.com{previewPagePath !== "/" ? previewPagePath : ""}
              </span>
            </div>
            {selectedSection && (
              <button className="flex items-center gap-1 px-2 py-1 ml-2 text-xs font-medium text-white bg-orange-600 rounded-lg md:hidden shrink-0" onClick={() => setRightPanelOpen(true)}>
                <Settings className="w-3 h-3" />Edit
              </button>
            )}
          </div> */}
          <div className={`relative transition-all duration-300 flex-1 overflow-hidden w-full min-h-0 ${viewport === "mobile" ? "max-w-[390px] rounded-[2rem] border-4 border-gray-700 shadow-2xl my-2 mx-auto" : ""}`}>
            {!iframeReady && (
              <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 ${isDark ? "bg-gray-950" : "bg-gray-100"}`}>
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Loading preview...</p>
              </div>
            )}
             {previewUrl && (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full bg-white border-0"
                onLoad={() => setIframeReady(true)}
                title="Store preview"
                allow="same-origin"
              />
            )}
            {iframeReady && !selectedId && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white/70 pointer-events-none whitespace-nowrap">
                Click any section to edit it
              </div>
            )}
          </div>
        </div>

        {rightPanelOpen && selectedSection && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setRightPanelOpen(false)} />}
        <div className={`flex-col border-l overflow-hidden transition-all duration-300 ${panelBg} ${panelBorder} hidden md:flex ${
          (selectedSection || isVirtualPanel) ? "md:w-72" : "md:w-0 md:border-l-0"
        }`}>
          {RightPanelContent}
        </div>
        <div className={`md:hidden fixed left-0 right-0 bottom-0 z-40 flex flex-col ${panelBg} border-t ${panelBorder} rounded-t-2xl shadow-2xl transition-transform duration-300 ${rightPanelOpen && (selectedSection || isVirtualPanel) ? "translate-y-0" : "translate-y-full"}`}  style={{ maxHeight: "70vh", minHeight: (selectedSection || isProductDetailPanel) ? "300px" : undefined }}>
          {RightPanelContent}
        </div>
      </div>
      {/* ── Header section picker modal ── */}
      {headerPickerOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setHeaderPickerOpen(false)}>
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <h3 className={`text-base font-semibold ${textPrimary}`}>Add section</h3>
              <button onClick={() => setHeaderPickerOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${hoverBg} ${textFaint}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {[
              { type: "announcement" as SectionType, label: "Announcement bar", desc: "Top banner with a short promotional message", icon: <Megaphone className="w-5 h-5" />, color: "#f59e0b" },
              { type: "ticker" as SectionType, label: "Scrolling ticker", desc: "Animated marquee strip for offers or updates", icon: <Radio className="w-5 h-5" />, color: "#6366f1" },
            ].map((item, idx) => (
              <button key={item.type}
                onClick={() => {
                  const ns: StoreSection = {
                    id: genId(),
                    type: item.type,
                    ...(item.type === "announcement" ? { title: "Free shipping on orders above ₹999 🎉", background_color: "#e65100", text_color: "#ffffff" } : {}),
                    ...(item.type === "ticker" ? { ticker_items: ["Free shipping on orders above ₹999", "New drops every week", "Official creator merchandise"], ticker_speed: 40, ticker_separator: "✦", background_color: "#111827", text_color: "#ffffff" } : {}),
                  }
                  // Insert at the top of home sections (header zone)
                  patchStore(p => ({
                    ...p,
                    sections: {
                      ...p.sections,
                      sections: [ns, ...(p.sections?.sections ?? [])],
                    }
                  }))
                  setSelectedId(ns.id)
                  setRightPanelOpen(true)
                  setHeaderPickerOpen(false)
                  setHasUnsavedChanges(true)
                }}
                className={`w-full flex items-center gap-4 px-5 py-5 text-left transition-colors ${
                  idx < 1 ? `border-b ${isDark ? "border-gray-800" : "border-gray-100"}` : ""
                } ${isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50"}`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0"
                  style={{ background: `${item.color}15`, color: item.color }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${textPrimary}`}>{item.label}</p>
                  <p className={`text-xs mt-1 leading-relaxed ${textFaint}`}>{item.desc}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDark
                    ? "bg-gray-700 text-gray-200 hover:bg-orange-500/20 hover:text-orange-400"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}>
                  Add
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page Editor Panel ────────────────────────────────────────────────────────

// REPLACE WITH:
function PageEditorPanel({ page, vendorHandle, onSave, onCancel, onDelete, isNew, isDark, onDraftChange }: {
  page: StorePage; vendorHandle: string; isNew: boolean; isDark: boolean
  onSave: (p: StorePage) => void | Promise<void>; onCancel: () => void; onDelete: () => void
   onDraftChange?: (updated: StorePage) => void
}) {
  const [draft, setDraft] = useState({ ...page })
   const up = (patch: Partial<StorePage>) => {
    const updated = { ...draft, ...patch }
    setDraft(updated)
    onDraftChange?.(updated)
  }
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-1">
        <button onClick={onCancel} className={`flex items-center gap-1 text-xs ${textFaint} transition-colors`}><ChevronLeft className="w-3.5 h-3.5" />Back</button>
        {!isNew && <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300">Delete</button>}
      </div>
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>Page title</label>
        <input
          type="text"
          value={draft.title}
          onChange={e => up({ title: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })}
          placeholder="e.g. About Me"
          className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"}`}
        />
      </div>
      <div>
        <label className={`text-[10px] ${textFaint} block mb-1`}>URL slug</label>
        <div className="flex items-center">
          <span className={`px-2 py-1.5 border border-r-0 rounded-l-lg text-[10px] whitespace-nowrap ${isDark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-100 border-gray-300 text-gray-400"}`}>/pages/</span>
          <input value={draft.slug} onChange={e => up({ slug: slugify(e.target.value) })} className={`flex-1 rounded-r-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"}`} />
        </div>
        <a href={getPageUrl(vendorHandle, draft.slug)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-orange-400 hover:text-orange-300 mt-1 flex items-center gap-1">
          <ExternalLink className="w-2.5 h-2.5" />Preview page
        </a>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={`text-[10px] ${textFaint}`}>Content</label>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${draft.content.trim().startsWith("<") ? "bg-red-900/20 border-red-800 text-red-400" : "bg-green-900/20 border-green-800 text-green-400"}`}>
            {draft.content.trim().startsWith("<") ? "HTML" : "Markdown"}
          </span>
        </div>
        {(draft.template === "terms" || draft.template === "privacy") && (() => {
          const match = draft.content.match(/\*Last updated:.*?\*/)
          const dateStr = match ? match[0].replace(/\*/g, "") : null
          return dateStr ? (
            <p className={`text-[10px] px-2.5 py-1.5 rounded-lg mb-1 ${isDark ? "bg-gray-800/50 text-gray-500 border border-gray-700" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
              🔒 {dateStr} — auto-updated on save
            </p>
          ) : null
        })()}
        <textarea
          value={draft.content.replace(/\*Last updated:.*?\*\n*/g, "")}
          onChange={e => {
            const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            const hasDate = draft.template === "terms" || draft.template === "privacy"
            const newContent = hasDate
              ? `*Last updated: ${today}*\n\n${e.target.value}`
              : e.target.value
            up({ content: newContent })
          }}
          placeholder={"Markdown: ## Heading\n\nHTML: <div>...</div>"}
          rows={10}
          className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none font-mono text-xs ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"}`}
        />
      </div>
      <div className="space-y-2">
        <p className={`text-[10px] ${textFaint}`}>Visibility</p>
        {[{ key: "in_nav", label: "Show in header nav", color: "blue" }, { key: "in_footer", label: "Show in footer", color: "purple" }].map(({ key, label, color }) => (
          <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${(draft as any)[key] ? `border-${color}-500/40 bg-${color}-500/10` : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`}>
            <input type="checkbox" checked={!!(draft as any)[key]} onChange={e => up({ [key]: e.target.checked } as any)} className="w-3.5 h-3.5 accent-orange-500" />
            <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
          <button onClick={() => {
          onSave(draft)
        }}className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` }}>
          <Save className="w-3 h-3" />{isNew ? "Create page" : "Save changes"}
        </button>
        <button onClick={onCancel} className={`px-3 py-2 rounded-lg border text-xs transition-colors ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}>Cancel</button>
      </div>
    </div>
  )
}

function PageSwitcherPagesGroup({ pages, currentPath, onSelect, setOpen, isDark, textFaint, hoverBg }: {
  pages: StorePage[]; currentPath: string; onSelect: (p: string) => void
  setOpen: (v: boolean) => void; isDark: boolean; textFaint: string; hoverBg: string
}) {
  const [expanded, setExpanded] = useState(false)
  const hasActive = pages.some(p => currentPath === `/pages/${p.slug}`)

  //if (isSearching && pages.length === 0) return null

  return (
    <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-2.5 py-2 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
          hasActive
            ? isDark ? "text-orange-400" : "text-orange-600"
            : "text-grey-50"
        } ${hoverBg}`}
      >
        <span>Custom pages {hasActive && `— ${pages.find(p => currentPath === `/pages/${p.slug}`)?.title}`}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && pages.map(p => {
        const path = `/pages/${p.slug}`
        return (
          <button key={p.id} onClick={() => { onSelect(path); setOpen(false) }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
              currentPath === path
                ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
            }`}>
            <span className="text-sm leading-none">📄</span>
            <span className="flex-1 truncate">{p.title}</span>
            {currentPath === path && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── PageSwitcherDropdown — Shopify-style page preview switcher ──────────────

function PageSwitcherDropdown({ currentPath, onSelect, pages, products = [], categories = [], collections = [], isDark, panelBorder, textPrimary, textFaint, hoverBg }: {
  currentPath: string
  onSelect: (path: string) => void
  pages: StorePage[]
  products?: { id: string; title: string; handle: string; thumbnail?: string }[]
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  isDark: boolean
  panelBorder: string
  textPrimary: string
  textFaint: string
  hoverBg: string
}) {
  const [open, setOpen] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [collectionSearch, setCollectionSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)}
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Built-in store pages — only pages that actually have routes in the storefront
  const builtinPages = [
    { label: "Home page",     path: "/",             icon: "🏠" },
    { label: "All Products",  path: "/products",     icon: "🛍️" },
    { label: "Categories", path: "/categories", icon: "🏷️" },
    //{ label: "Single Category", path: "/categories/example", icon: "🏷️" },
    { label: "Collections",   path: "/collections",  icon: "📦" },
    // { label: "Single Collection", path: "/collections/example", icon: "🗂️" },
    // { label: "Cart",          path: "/cart",         icon: "🛒" },
    { label: "Search",        path: "/search",       icon: "🔍" },
  ]

  const filteredProducts = productSearch.trim()
    ? products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
    : products.slice(0, 8)

  // Find label for current path
  const allPages = [
    ...builtinPages,
    ...pages.map(p => ({ label: p.title, path: `/pages/${p.slug}`, icon: "📄" })),
    ...products.map(p => ({ label: p.title, path: `/products/${p.handle}`, icon: "👕" })),
  ]
  const currentLabel =
  currentPath === "/" ? "Home page" :
  currentPath === "/products" ? "All Products" :
  currentPath === "/categories" ? "Categories" :
  currentPath === "/collections" ? "Collections" :
  currentPath === "/search" ? "Search" :
  currentPath.startsWith("/products/") ? "Product page" :
  currentPath.startsWith("/collections/") ? "Collection page" :
  currentPath.startsWith("/categories/") ? "Category page" :
  currentPath.startsWith("/pages/") ? (pages.find(p => `/pages/${p.slug}` === currentPath)?.title ?? "Custom page") :
  "Home page"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          open
            ? isDark ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : "border-orange-400 bg-orange-50 text-orange-600"
            : isDark ? `border-gray-700 text-gray-300 ${hoverBg}` : `border-gray-300 text-gray-700 ${hoverBg}`
        }`}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline max-w-[120px] truncate">{currentLabel}</span>
        <ChevronDownIcon className="w-3 h-3 shrink-0" />
      </button>

      {open && (
        <div
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 w-64 rounded-xl border shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          {/* Built-in pages */}
          <div className="p-1">
            <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>Store pages</p>
            {builtinPages.map(p => (
              <button key={p.path} onClick={() => { onSelect(p.path); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                  currentPath === p.path
                    ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                    : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                }`}>
                <span className="text-sm leading-none">{p.icon}</span>
                <span className="flex-1">{p.label}</span>
                {currentPath === p.path && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
              </button>
            ))}
          </div>

          {pages.length > 0 && (
            <PageSwitcherPagesGroup
              pages={pages}
              currentPath={currentPath}
              onSelect={onSelect}
              setOpen={setOpen}
              isDark={isDark}
              textFaint={textFaint}
              hoverBg={hoverBg}
            />
          )}

          {/* Product pages */}
          {products.length > 0 && (
            <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <div className="p-1">
                <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                  Product page
                </p>
                <button
                  onClick={() => {
                    onSelect(`/products/${products[0].handle}`)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    currentPath.startsWith("/products/") && currentPath !== "/products"
                      ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                      : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                  }`}
                >
                  <span className="text-sm leading-none">👕</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">Product page template</p>
                    <p className={`text-[10px] ${textFaint}`}>Changes apply to all product pages</p>
                  </div>
                  {currentPath.startsWith("/products/") && currentPath !== "/products" && (
                    <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}

            {/* Collection pages */}
            {/* {collections.length > 0 && (
              <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <div className="px-2 pt-1.5 pb-1">
                  <p className={`px-0.5 pb-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                    Collection pages
                  </p>
                </div>
                <div className="px-1 pb-1 overflow-y-auto max-h-36">
                  {collections.map((col: any) => {
                    const path = `/collections/${col.handle}`
                    return (
                      <button key={col.id} onClick={() => { onSelect(path); setOpen(false) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          currentPath === path
                            ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                            : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                        }`}>
                        <span className="text-sm leading-none shrink-0">🗂️</span>
                        <span className="flex-1 truncate">{col.title}</span>
                        {currentPath === path && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )} */}

            {/* Collection pages */}
          {collections.length > 0 && (
            <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
              <div className="p-1">
                <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                  Collection page
                </p>
                <button
                  onClick={() => {
                    onSelect(`/collections/${collections[0].handle}`)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                    currentPath.startsWith("/collections/") && currentPath !== "/collections"
                      ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                      : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                  }`}
                >
                  <span className="text-sm leading-none">🗂️</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">Collection page template</p>
                    <p className={`text-[10px] ${textFaint}`}>Changes apply to all collection pages</p>
                  </div>
                  {currentPath.startsWith("/collections/") && currentPath !== "/collections" && (
                    <Check className="w-3 h-3 text-orange-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          )}

            {/* Category pages */}
            {categories.length > 0 && (
              <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <div className="p-1">
                  <p className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${textFaint}`}>
                    Category page
                  </p>
                  <button
                    onClick={() => {
                      onSelect(`/categories/${categories[0].handle}`)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                      currentPath.startsWith("/categories/") && currentPath !== "/categories"
                        ? isDark ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                        : isDark ? `text-gray-300 ${hoverBg}` : `text-gray-700 ${hoverBg}`
                    }`}
                  >
                    <span className="text-sm leading-none">🏷️</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">Category page template</p>
                      <p className={`text-[10px] ${textFaint}`}>Changes apply to all category pages</p>
                    </div>
                    {currentPath.startsWith("/categories/") && currentPath !== "/categories" && (
                      <Check className="w-3 h-3 text-orange-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

// ADD this component right above ProductPickerButton:
function ProductPickerModal({ products, selectedProduct, onSelect, onClose, isDark }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any; onSelect: (p: any) => void
  onClose: () => void; isDark: boolean
}) {
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState(selectedProduct?.id ?? null)

  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  const hoverBg = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
  const borderColor = isDark ? "border-gray-700" : "border-gray-200"
  const bgPanel = isDark ? "bg-gray-800" : "bg-white"

  const filtered = search.trim()
    ? products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className={`w-[420px] max-w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${bgPanel} ${isDark ? "border-gray-700" : "border-gray-200"}`}
        onClick={e => e.stopPropagation()}>

        <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary}`}>Select a product to feature</h3>
          <button onClick={onClose} className={`p-1 rounded-lg ${hoverBg} ${textFaint}`}><X className="w-4 h-4" /></button>
        </div>

        <div className={`px-4 py-3 border-b ${borderColor}`}>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${borderColor} ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
            <Search className={`w-3.5 h-3.5 shrink-0 ${textFaint}`} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`flex-1 text-sm bg-transparent focus:outline-none ${textPrimary} placeholder-gray-400`} />
            {search && <button onClick={() => setSearch("")} className={`${textFaint} hover:text-red-400`}><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>

        <div className="overflow-y-auto max-h-64">
          {filtered.length === 0
            ? <p className={`px-4 py-6 text-sm text-center italic ${textFaint}`}>No products found</p>
            : filtered.map(p => (
              <button key={p.id} onClick={() => setPendingId(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${borderColor} last:border-0 ${
                  pendingId === p.id ? isDark ? "bg-orange-500/15" : "bg-orange-50" : hoverBg
                }`}>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  pendingId === p.id ? "border-orange-500 bg-orange-500" : isDark ? "border-gray-600" : "border-gray-300"
                }`}>
                  {pendingId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                {p.thumbnail
                  ? <img src={p.thumbnail} alt={p.title} className="object-cover w-10 h-10 rounded-xl shrink-0" />
                  : <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                      <ShoppingBag className={`w-5 h-5 ${textFaint}`} />
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${textPrimary}`}>{p.title}</p>
                  <p className={`text-[11px] ${textFaint} truncate`}>/{p.handle}</p>
                </div>
              </button>
            ))
          }
        </div>

        <div className={`flex items-center justify-end gap-2.5 px-4 py-3 border-t ${borderColor}`}>
          <button onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${isDark ? `border-gray-700 ${textFaint} hover:border-gray-500` : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            Cancel
          </button>
          <button
            disabled={!pendingId}
            onClick={() => { const p = products.find(x => x.id === pendingId); if (p) { onSelect(p); onClose() } }}
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #e65100 0%, #ac1900 100%)" }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductPickerButton({ products, selectedProduct, onSelect, onClear, isDark, textFaint }: {
  products: { id: string; title: string; handle: string; thumbnail?: string }[]
  selectedProduct: any; onSelect: (p: any) => void
  onClear: () => void; isDark: boolean; textFaint: string
}) {
  const [open, setOpen] = useState(false)
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
  const borderColor = isDark ? "border-gray-700" : "border-gray-200"

  return (
    <>
      {selectedProduct ? (
        <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border ${borderColor} ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
          {selectedProduct.thumbnail && (
            <img src={selectedProduct.thumbnail} alt={selectedProduct.title} className="object-cover rounded-lg w-9 h-9 shrink-0" />
          )}
          <div className="flex-1 min-w-0" title={selectedProduct.title}>
            <p className={`text-xs font-semibold truncate ${textPrimary}`}>{selectedProduct.title}</p>
            {/* <p className={`text-[10px] ${textFaint}`}>/{selectedProduct.handle}</p> */}
          </div>
          <button onClick={() => setOpen(true)}
            className="text-[10px] px-2 py-1 rounded-lg border border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors shrink-0">
            Change
          </button>
          <button onClick={onClear} className={`p-1 ${textFaint} hover:text-red-400 transition-colors shrink-0`}>
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed text-xs font-medium transition-all ${
            isDark ? "border-gray-600 text-gray-400 hover:border-orange-500/50 hover:text-orange-400"
                   : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500"
          }`}>
          <ShoppingBag className="w-3.5 h-3.5" />
          Select a product
        </button>
      )}

      {open && (
        <ProductPickerModal
          products={products}
          selectedProduct={selectedProduct}
          onSelect={(p) => { onSelect(p); setOpen(false) }}
          onClose={() => setOpen(false)}
          isDark={isDark}
        />
      )}
    </>
  )
}

// ─── Section Settings ─────────────────────────────────────────────────────────

function SectionSettings({ section, onChange, token, backendUrl, isDark, collections = [], categories = [], pages = [], products = [], vendorHandle = "", currentLayoutKey = "home", storeLogo = "" }: {
  section: StoreSection; onChange: (p: Partial<StoreSection>) => void
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  pages?: StorePage[]
  currentLayoutKey?: string
  products?: { id: string; title: string; handle: string; thumbnail?: string; variants?: any[]; options?: any[] }[]
  vendorHandle?: string
  storeLogo?: string
  token: string; backendUrl: string; isDark: boolean
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<string>("")

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData(); fd.append("files", file)
    const res = await fetch(`${backendUrl}/vendors/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (!res.ok) return null
    const data = await res.json(); return data.files?.[0]?.url ?? null
  }
  const triggerUpload = (key: string) => { setUploadTarget(key); fileRef.current?.click() }

  const textFaint = isDark ? "text-gray-500" : "text-gray-400"
  const textPrimary = isDark ? "text-white" : "text-gray-900"

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={async e => {
          if (!e.target.files?.[0]) return
          setUploadingKey(uploadTarget)
          const url = await uploadFile(e.target.files[0])
          if (url) onChange({ [uploadTarget]: url })
          setUploadingKey(null); e.target.value = ""
        }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      {section.type === "hero" && (<>
        <Field label="Badge text" faint={textFaint}> <EditorInput value={(section as any).hero_badge ?? "Official Merch Store"} onChange={v => onChange({ hero_badge: v } as any)} placeholder="Official Merch Store" isDark={isDark} /></Field>
         <Field label="Headline" faint={textFaint}>
          <EditorInput value={section.headline ?? ""} onChange={v => onChange({ headline: v })} placeholder="My store is now live" isDark={isDark} />
        </Field>
        <Field label="Heading text size" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1">
            {(["sm", "md", "lg"] as const).map(size => (
              <button key={size} onClick={() => onChange({ headline_size: size })}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-all capitalize ${
                  (section.headline_size ?? "lg") === size
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                {size === "sm" ? "Small" : size === "md" ? "Regular" : "Large"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Subtext" faint={textFaint}><EditorInput value={section.subtext ?? ""} onChange={v => onChange({ subtext: v })} placeholder="A supporting tagline" isDark={isDark} /></Field>
        <div className="grid grid-cols-1 gap-2">
          <Field label="Primary CTA" faint={textFaint}><EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })} placeholder="Shop Now" isDark={isDark} /></Field>
          <Field label="CTA link" faint={textFaint}>
            <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="/products" isDark={isDark} pages={pages} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Field label="Secondary CTA" faint={textFaint}><EditorInput value={section.cta_secondary_label ?? ""} onChange={v => onChange({ cta_secondary_label: v })} placeholder="Browse all" isDark={isDark} /></Field>
          <Field label="Secondary link" faint={textFaint}>
            <LinkInput value={section.cta_secondary_url ?? ""} onChange={v => onChange({ cta_secondary_url: v })} placeholder="/products" isDark={isDark} pages={pages} />
          </Field>
        </div>
        {/* Background image — upload only, no text input */}
        <UploadOnlyImageField
          label="Background image"
          value={section.background_image ?? ""}
          onChange={v => onChange({ background_image: v || undefined })}
          onUpload={() => triggerUpload("background_image")}
          isUploading={uploadingKey === "background_image"}
          isDark={isDark}
        />
        {/* Hero right-side image */}
        <UploadOnlyImageField
          label="Right side image"
          value={(section as any).hero_image_right ?? ""}
          onChange={v => onChange({ hero_image_right: v || undefined } as any)}
          onUpload={() => triggerUpload("hero_image_right")}
          isUploading={uploadingKey === "hero_image_right"}
          isDark={isDark}
          previewHeight={120}
        />
        {/* Hero-specific overlay colors — SEPARATE from section override */}
        <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <p className={`text-[10px] ${textFaint} mb-2`}>Hero overlay & text</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Overlay color" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.overlay_color ?? "#000000"} onChange={e => onChange({ overlay_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.overlay_color ?? ""} onChange={v => onChange({ overlay_color: v })} placeholder="#000000" isDark={isDark} />
              </div>
            </Field>
            <Field label="Text color" faint={textFaint}>
              <div className="flex gap-1.5">
                <input type="color" value={section.overlay_text_color ?? "#ffffff"} onChange={e => onChange({ overlay_text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                <EditorInput value={section.overlay_text_color ?? ""} onChange={v => onChange({ overlay_text_color: v })} placeholder="#ffffff" isDark={isDark} />
              </div>
            </Field>
          </div>
        </div>
      </>)}

      {/* ── ANNOUNCEMENT ─────────────────────────────────────────────── */}
      {section.type === "announcement" && (<>
        <Field label="Message — select text to add link or style" faint={textFaint}>
          <RichTextEditor
            value={section.title ?? ""}
            onChange={v => onChange({ title: v })}
            placeholder="Free shipping on orders above ₹999 🎉"
            isDark={isDark}
            singleLine
            showToolbar={true}
          />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-70`}>Select specific words → click 🔗 to hyperlink just those words</p>
        </Field>
         <Field label="Position" faint={textFaint}>
          <div className="grid grid-cols-2 gap-1">
            {(["above", "below"] as const).map(pos => (
              <button key={pos}
                onClick={() => onChange({ ticker_position: pos === "above" ? undefined : "below" } as any)}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  ((section as any).ticker_position ?? "above") === pos
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>
                {pos === "above" ? "⬆ Above header" : "⬇ Below header"}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#e65100"} onChange={e => onChange({ background_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.background_color ?? "#e65100"} onChange={v => onChange({ background_color: v })} isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"} onChange={e => onChange({ text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5" />
              <EditorInput value={section.text_color ?? "#ffffff"} onChange={v => onChange({ text_color: v })} isDark={isDark} />
            </div>
          </Field>
        </div>
        {section.title && (
          <div className="px-3 py-2 text-xs font-medium text-center rounded-lg" style={{ background: section.background_color ?? "#e65100", color: section.text_color ?? "#ffffff" }}
            dangerouslySetInnerHTML={{ __html: section.title }} />
        )}
      </>)}

      {/* ── COLLECTION / FEATURED ────────────────────────────────────── */}
       {(section.type === "collection" || section.type === "featured") && (<>
        <Field label="Section title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder={section.type === "featured" ? "Featured Drops" : "All Products"} isDark={isDark} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Max products" faint={textFaint}>
            <input type="number" min={1} max={48} value={section.limit ?? 12} onChange={e => onChange({ limit: parseInt(e.target.value) || 12 })} className={`w-full px-2 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"}`} />
          </Field>
          <Field label="Columns" faint={textFaint}>
            <div className="flex gap-1">
              {([2,3,4] as const).map(n => (
                <button key={n} onClick={() => onChange({ columns: n })} className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${section.columns === n || (!section.columns && n === 3) ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>{n}</button>
              ))}
            </div>
          </Field>
        </div>
        {section.type === "featured" && (
          <Field label="Specific product IDs (one per line)" faint={textFaint}>
            <EditorTextarea value={section.product_ids?.join("\n") ?? ""} onChange={v => onChange({ product_ids: v.split("\n").map(s => s.trim()).filter(Boolean) })} placeholder={"prod_01...\nprod_02..."} rows={3} isDark={isDark} />
            <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Leave empty to show latest products</p>
          </Field>
        )}
         <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_product_count: !(section.show_product_count ?? true) })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_product_count !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_product_count !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show product count</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ show_sold_out: !section.show_sold_out })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.show_sold_out !== false ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.show_sold_out !== false ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Show sold-out products</span>
        </label>
 
        {/* ── Filter sidebar controls — only for collection sections (not featured) ── */}
        {section.type === "collection" && ["products", "collection", "category"].includes(currentLayoutKey ?? "") && (
          <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-3 uppercase tracking-wider font-semibold`}>Filter sidebar</p>
            <div className="space-y-2.5">
              {[
                { key: "show_filters",           label: "Show filter sidebar",         hint: "Toggles entire sidebar"          },
                { key: "show_sort",              label: "Show sort dropdown",           hint: "Newest, price, A–Z"              },
                { key: "show_price_filter",      label: "Show price range filter",      hint: "Slider + min/max inputs"         },
                { key: "show_category_filter",   label: "Show category filter",         hint: "Checkbox list of categories"     },
                { key: "show_collection_filter", label: "Show collection filter",       hint: "Checkbox list of collections"    },
              ].map(({ key, label, hint }) => {
                const val = section[key] !== undefined ? section[key] : true  // default all on
                return (
                  <label key={key} className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${val ? "border-orange-500/40 bg-orange-500/10" : `${isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200"}`}`}>
                    <div className="relative mt-0.5 shrink-0" onClick={() => onChange({ [key]: !val })}>
                      <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${textPrimary}`}>{label}</p>
                      <p className={`text-[10px] mt-0.5 ${textFaint}`}>{hint}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </>)}

      {section.type === "category_products" && (<>
        {/* <Field label="Page heading" faint={textFaint}>
          <EditorInput
            value={section.title ?? "Products"}
            onChange={v => onChange({ title: v })}
            placeholder="Products"
            isDark={isDark}
          />
        </Field> */}

        <Field label="Columns" faint={textFaint}>
          <div className="grid grid-cols-3 gap-1">
            {([2, 3, 4] as const).map(n => (
              <button key={n} onClick={() => onChange({ columns: n })}
                className={`py-1.5 rounded-lg border text-xs transition-all ${
                  (section.columns ?? 3) === n
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>{n}</button>
            ))}
          </div>
        </Field>

        {/* Filter sidebar toggles — same as products page */}
        <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <p className={`text-[10px] ${textFaint} mb-3 uppercase tracking-wider font-semibold`}>
          Filter sidebar
        </p>

        {/* Master toggle */}
        {(() => {
          const val = section.show_filters !== false
          return (
            <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all mb-2 ${
              val ? "border-orange-500/40 bg-orange-500/10" : isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <div className="relative mt-0.5 shrink-0" onClick={() => onChange({ show_filters: !val })}>
                <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
              </div>
              <div>
                <p className={`text-xs font-medium ${textPrimary}`}>Show filter sidebar</p>
                <p className={`text-[10px] mt-0.5 ${textFaint}`}>Toggles entire sidebar</p>
              </div>
            </label>
          )
        })()}

        {/* Orderable filter items */}
        {(() => {
          const defaultOrder = ["sort", "price", "category", "collection"]
          const filterOrder: string[] = section.filter_order ?? defaultOrder

          const FILTER_META: Record<string, { label: string; hint: string; key: string }> = {
            sort:       { label: "Sort dropdown",       hint: "Newest, price, A–Z",           key: "show_sort" },
            price:      { label: "Price range filter",  hint: "Slider + min/max inputs",      key: "show_price_filter" },
            category:   { label: "Category filter",     hint: "Checkbox list of categories",  key: "show_category_filter" },
            collection: { label: "Collection filter",   hint: "Checkbox list of collections", key: "show_collection_filter" },
          }

          const moveFilter = (id: string, dir: "up" | "down") => {
            const arr = [...filterOrder]
            const i = arr.indexOf(id)
            const swap = dir === "up" ? i - 1 : i + 1
            if (swap < 0 || swap >= arr.length) return
            ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
            onChange({ filter_order: arr })
          }

          return (
            <div className="space-y-1.5">
              {filterOrder.map((id, i) => {
                const meta = FILTER_META[id]
                if (!meta) return null
                const val = section[meta.key] !== false
                return (
                  <div key={id} className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
                    val
                      ? isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                      : isDark ? "border-gray-800 opacity-50" : "border-gray-100 opacity-50"
                  }`}>
                    {/* Toggle */}
                    <div className="relative shrink-0" onClick={() => onChange({ [meta.key]: !val })}>
                      <div className={`w-7 h-3.5 rounded-full transition-colors cursor-pointer ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                      <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-3.5" : ""}`} />
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${textPrimary}`}>{meta.label}</p>
                      <p className={`text-[10px] ${textFaint} truncate`}>{meta.hint}</p>
                    </div>

                    {/* Up/Down arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveFilter(id, "up")}
                        disabled={i === 0}
                        className={`p-0.5 rounded transition-colors ${
                          i === 0 ? "opacity-20" : isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                      >
                        <ChevronUp className={`w-3 h-3 ${textFaint}`} />
                      </button>
                      <button
                        onClick={() => moveFilter(id, "down")}
                        disabled={i === filterOrder.length - 1}
                        className={`p-0.5 rounded transition-colors ${
                          i === filterOrder.length - 1 ? "opacity-20" : isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                      >
                        <ChevronDown className={`w-3 h-3 ${textFaint}`} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

        {/* Section Colors */}
        <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section Colors</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Background" faint={textFaint}>
              <div className="space-y-1.5">
                {section.background_color ? (
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={section.background_color}
                      onChange={e => onChange({ background_color: e.target.value })}
                      className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                    <input type="text" value={section.background_color}
                      onChange={e => onChange({ background_color: e.target.value })}
                      className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                        isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                      }`} />
                    <button onClick={() => onChange({ background_color: undefined })}
                      className="text-red-400 shrink-0 hover:text-red-300"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => onChange({ background_color: "#ffffff" })}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                      isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                            : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                    }`}>
                    <Plus className="w-3 h-3" />Set color
                  </button>
                )}
              </div>
            </Field>
            <Field label="Text" faint={textFaint}>
              <div className="space-y-1.5">
                {section.text_color ? (
                  <div className="flex gap-1.5 items-center">
                    <input type="color" value={section.text_color}
                      onChange={e => onChange({ text_color: e.target.value })}
                      className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                    <input type="text" value={section.text_color}
                      onChange={e => onChange({ text_color: e.target.value })}
                      className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                        isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                      }`} />
                    <button onClick={() => onChange({ text_color: undefined })}
                      className="text-red-400 shrink-0 hover:text-red-300"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => onChange({ text_color: "#111827" })}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                      isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                            : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                    }`}>
                    <Plus className="w-3 h-3" />Set color
                  </button>
                )}
              </div>
            </Field>
          </div>
        </div>
      </>)}

      {section.type === "collections_grid" && (<>
      <Field label="Page heading" faint={textFaint}>
        <EditorInput
          value={section.title ?? "Collections"}
          onChange={v => onChange({ title: v })}
          placeholder="Collections"
          isDark={isDark}
        />
      </Field>

      <Field label="Columns" faint={textFaint}>
        <div className="grid grid-cols-3 gap-1">
          {([2, 3, 4] as const).map(n => (
            <button key={n} onClick={() => onChange({ columns: n })}
              className={`py-1.5 rounded-lg border text-xs transition-all ${
                (section.columns ?? 3) === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{n}</button>
          ))}
        </div>
      </Field>

      <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section Colors</p>
        <div className="grid grid-cols-2 gap-2">

          <Field label="Background" faint={textFaint}>
            <div className="space-y-1.5">
              {section.background_color ? (
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark
                        ? "bg-gray-800 border border-gray-700 text-gray-200"
                        : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button
                    onClick={() => onChange({ background_color: undefined })}
                    className="text-red-400 transition-colors shrink-0 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onChange({ background_color: "#ffffff" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>

          <Field label="Text" faint={textFaint}>
            <div className="space-y-1.5">
              {section.text_color ? (
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark
                        ? "bg-gray-800 border border-gray-700 text-gray-200"
                        : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button
                    onClick={() => onChange({ text_color: undefined })}
                    className="text-red-400 transition-colors shrink-0 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onChange({ text_color: "#111827" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>

        </div>
      </div>
    </>)}

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      {section.type === "about" && (<>
        <Field label="Title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="About Me" isDark={isDark} /></Field>
        <Field label="Content" faint={textFaint}><EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Share your story..." rows={6} isDark={isDark} /></Field>
        <UploadOnlyImageField label="Image" value={section.image ?? ""} onChange={v => onChange({ image: v || undefined })} onUpload={() => triggerUpload("image")} isUploading={uploadingKey === "image"} isDark={isDark} />
        <Field label="Image position" faint={textFaint}>
          <div className="flex gap-2">
            {(["left", "right"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ image_position: pos })} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.image_position ?? "left") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                Image {pos}
              </button>
            ))}
          </div>
        </Field>
      </>)}

      {/* ── SOCIAL ───────────────────────────────────────────────────── */}
      {section.type === "social" && (
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint} opacity-70 mb-1`}>Toggle which platforms to show</p>
          {[
            { key: "show_instagram", label: "Instagram", color: "#E1306C" },
            { key: "show_youtube",   label: "YouTube",   color: "#FF0000" },
            { key: "show_twitter",   label: "X",         color: "#1DA1F2" },
            { key: "show_facebook",  label: "Facebook",  color: "#1877F2" },
          ].map(({ key, label, color }) => (
            <label key={key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border border-transparent ${isDark ? "bg-gray-800/50 hover:bg-gray-800 hover:border-gray-700" : "bg-gray-50 hover:bg-gray-100"}`}>
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className={`flex-1 text-sm ${textPrimary}`}>{label}</span>
              <div className="relative w-8 h-4 shrink-0" onClick={() => onChange({ [key]: !(section as any)[key] })}>
                <div className={`w-8 h-4 rounded-full transition-colors ${(section as any)[key] ? "bg-orange-500" : "bg-gray-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${(section as any)[key] ? "translate-x-4" : ""}`} />
              </div>
            </label>
          ))}
        </div>
      )}

      {/* ── TEXT ─────────────────────────────────────────────────────── */}
      {section.type === "text" && (
        <Field label="Content" faint={textFaint}>
          <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Write your content..." rows={10} isDark={isDark} />
        </Field>
      )}

      {/* ── IMAGE — upload only ───────────────────────────────────────── */}
      {section.type === "image" && (
        <UploadOnlyImageField label="Image" value={section.image ?? ""} onChange={v => onChange({ image: v || undefined })} onUpload={() => triggerUpload("image")} isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={140} />
      )}

      {/* ── VIDEO ────────────────────────────────────────────────────── */}
      {section.type === "video" && (<>
        <Field label="Section title (optional)" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Watch me" isDark={isDark} /></Field>
        <Field label="Video URL" faint={textFaint}>
          <EditorInput value={section.video_url ?? ""} onChange={v => onChange({ video_url: v })} placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>YouTube and Vimeo supported</p>
        </Field>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative" onClick={() => onChange({ video_autoplay: !section.video_autoplay })}>
            <div className={`w-8 h-4 rounded-full transition-colors ${section.video_autoplay ? "bg-orange-500" : "bg-gray-600"}`} />
            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${section.video_autoplay ? "translate-x-4" : ""}`} />
          </div>
          <span className={`text-xs ${textPrimary}`}>Autoplay (muted)</span>
        </label>
        {/* {section.video_url && <div className="mt-1 p-2 rounded-lg text-[10px] text-green-400 border border-green-800/50 bg-green-900/20">✓ Video URL set</div>} */}
      </>)}

      {/* ── LINKS ────────────────────────────────────────────────────── */}
      {section.type === "links" && (<>
        <Field label="Section title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="My Links" isDark={isDark} /></Field>
        <div className="space-y-2">
          <p className={`text-[10px] ${textFaint}`}>Links</p>
          {(section.links ?? []).map((link, i) => (
            <div key={link.id} className={`p-2 rounded-lg border space-y-1.5 ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-1.5">
                <EditorInput value={link.label} onChange={v => { const links = [...(section.links ?? [])]; links[i] = { ...links[i], label: v }; onChange({ links }) }} placeholder="Button label" isDark={isDark} />
                <button onClick={() => { const links = (section.links ?? []).filter((_, j) => j !== i); onChange({ links }) }} className="p-1 text-red-400 rounded hover:bg-red-900/30 shrink-0"><Trash2 className="w-3 h-3" /></button>
              </div>
              <LinkInput value={link.url} onChange={v => { const links = [...(section.links ?? [])]; links[i] = { ...links[i], url: v }; onChange({ links }) }} placeholder="https://... or /path" isDark={isDark} pages={pages} />
            </div>
          ))}
          <button onClick={() => onChange({ links: [...(section.links ?? []), { id: `l_${Date.now()}`, label: "New Link", url: "" }] })}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${isDark ? "border-gray-700 border-dashed text-gray-400 hover:border-gray-500 hover:text-gray-300" : "border-gray-300 border-dashed text-gray-500 hover:border-gray-400"}`}>
            <Plus className="w-3 h-3" />Add link
          </button>
        </div>
      </>)}

      {/* ── FEATURED COLLECTIONS ─────────────────────────────────────── */}
      {section.type === "featured_collections" && (<>
        <Field label="Section title" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Shop by Collection" isDark={isDark} /></Field>
        <Field label="Columns" faint={textFaint}>
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map(n => (
              <button key={n} onClick={() => onChange({ columns: n })} className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${section.columns === n || (!section.columns && n === 3) ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}`}>{n}</button>
            ))}
          </div>
        </Field>
        <Field label="Choose collections" faint={textFaint}>
          <p className={`text-[10px] mb-2 ${textFaint}`}>Select which collections to display. Leave empty to show all.</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(collections ?? []).length === 0
              ? <p className={`text-[11px] italic ${textFaint}`}>No collections found. Create collections in your dashboard first.</p>
              : (collections ?? []).map(col => {
                const selected = (section.collection_ids ?? []).includes(col.id)
                return (
                  <label key={col.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${selected ? isDark ? "border-violet-500/50 bg-violet-500/10" : "border-violet-400/50 bg-violet-50" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" checked={selected} onChange={e => { const ids = section.collection_ids ?? []; onChange({ collection_ids: e.target.checked ? [...ids, col.id] : ids.filter(id => id !== col.id) }) }} className="w-3.5 h-3.5 accent-violet-500 shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>{col.title}</p>
                      <p className={`text-[10px] truncate ${textFaint}`}>/{col.handle}</p>
                    </div>
                    {selected && <span className="ml-auto text-[10px] font-semibold text-violet-500">✓</span>}
                  </label>
                )
              })}
          </div>
          {(section.collection_ids ?? []).length > 0 && (
            <button onClick={() => onChange({ collection_ids: [] })} className={`mt-2 text-[10px] ${textFaint} hover:text-red-400 transition-colors`}>Clear selection (show all)</button>
          )}
        </Field>
      </>)}

      {/* ── HTML ─────────────────────────────────────────────────────── */}
      {section.type === "html" && (
        <Field label="Custom HTML / CSS / JS" faint={textFaint}>
          <EditorTextarea value={section.html_content ?? ""} onChange={v => onChange({ html_content: v })}
            placeholder={"<div style=\"padding:40px;text-align:center\">\n  <h2>Custom content</h2>\n</div>"} rows={12} isDark={isDark} mono />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Rendered in an isolated iframe to prevent CSS leakage.</p>
        </Field>
      )}

      {/* ── DIVIDER ──────────────────────────────────────────────────── */}
      {/* {section.type === "divider" && (
        <div className="py-6 text-center">
          <div className={`w-full h-px mb-3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <p className={`text-xs ${textFaint}`}>No settings — just a visual separator.</p>
        </div>
      )} */}

      {section.type === "divider" && (
        <div className="space-y-3">
          <Field label="Thickness (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={16} value={(section as any).divider_thickness ?? 1}
                onChange={e => onChange({ divider_thickness: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-6 text-right ${textFaint}`}>{(section as any).divider_thickness ?? 1}</span>
            </div>
          </Field>
          <Field label="Color" faint={textFaint}>
            <div className="flex gap-1.5 items-center">
              <input type="color" value={(section as any).divider_color ?? "#e5e7eb"}
                onChange={e => onChange({ divider_color: e.target.value } as any)}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={(section as any).divider_color ?? "#e5e7eb"}
                onChange={v => onChange({ divider_color: v } as any)}
                placeholder="#e5e7eb" isDark={isDark} />
              {(section as any).divider_color && (
                <button onClick={() => onChange({ divider_color: undefined } as any)} className="text-red-400 shrink-0"><X className="w-3 h-3" /></button>
              )}
            </div>
          </Field>
          <Field label="Padding top (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={120} step={4} value={(section as any).padding_top ?? 16}
                onChange={e => onChange({ padding_top: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-8 text-right ${textFaint}`}>{(section as any).padding_top ?? 16}px</span>
            </div>
          </Field>
          <Field label="Padding bottom (px)" faint={textFaint}>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={120} step={4} value={(section as any).padding_bottom ?? 16}
                onChange={e => onChange({ padding_bottom: Number(e.target.value) } as any)}
                className="flex-1 accent-orange-500" />
              <span className={`text-xs w-8 text-right ${textFaint}`}>{(section as any).padding_bottom ?? 16}px</span>
            </div>
          </Field>
        </div>
      )}

      {/* ── TICKER ───────────────────────────────────────────────────── */}
      {section.type === "ticker" && (<>
        <Field label="Ticker items (one per line)" faint={textFaint}>
          <RichTextEditor
            value={(section.ticker_items ?? []).join("<br>")}
            onChange={v => {
              // Split on <br> variants, strip remaining HTML, filter empty
              const items = v
                .split(/<br\s*\/?>/gi)
                .map(s => {
                  const tmp = document.createElement("div")
                  tmp.innerHTML = s
                  return (tmp.textContent ?? tmp.innerText ?? "").trim()
                })
                .filter(Boolean)
              onChange({ ticker_items: items })
            }}
            placeholder="Free shipping on orders above ₹999"
            isDark={isDark}
            rows={5}
            singleLine={false}
            showToolbar={false}
          />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Each line is one item in the scroll.</p>
        </Field>
        <Field label="Position" faint={textFaint}>
          <div className="grid grid-cols-2 gap-1">
            {(["above", "below"] as const).map(pos => (
              <button key={pos} onClick={() => onChange({ ticker_position: pos === "above" ? undefined : "below" } as any)}
                className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                  ((section as any).ticker_position ?? "above") === pos
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                    : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                }`}>
                {pos === "above" ? "⬆ Above header" : "⬇ Below header"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Separator between items" faint={textFaint}>
          <EditorInput value={section.ticker_separator ?? "✦"} onChange={v => onChange({ ticker_separator: v })} placeholder="✦  •  |" isDark={isDark} />
        </Field>
        <Field label="Scroll speed" faint={textFaint}>
          <div className="flex items-center gap-3">
            <input type="range" min={10} max={100} value={section.ticker_speed ?? 40}
              onChange={e => onChange({ ticker_speed: Number(e.target.value) })}
              className="flex-1 accent-orange-500" />
            <span className={`text-xs w-8 text-right ${textFaint}`}>{section.ticker_speed ?? 40}</span>
          </div>
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>Lower = slower, higher = faster.</p>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.background_color ?? "#111827"} onChange={e => onChange({ background_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={section.background_color ?? "#111827"} onChange={v => onChange({ background_color: v })} isDark={isDark} />
            </div>
          </Field>
          <Field label="Text color" faint={textFaint}>
            <div className="flex gap-1.5">
              <input type="color" value={section.text_color ?? "#ffffff"} onChange={e => onChange({ text_color: e.target.value })} className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <EditorInput value={section.text_color ?? "#ffffff"} onChange={v => onChange({ text_color: v })} isDark={isDark} />
            </div>
          </Field>
        </div>
        {/* Live preview */}
        {(section.ticker_items ?? []).length > 0 && (
          <div className="px-3 py-2 overflow-hidden text-xs font-medium rounded-lg"
            style={{ background: section.background_color ?? "#111827", color: section.text_color ?? "#ffffff" }}>
            {(section.ticker_items ?? []).join(` ${section.ticker_separator ?? "✦"} `)}
          </div>
        )}
      </>)}

      {/* ── IMAGE WITH TEXT ───────────────────────────────────────────── */}
      {section.type === "image_text" && (<>
        <Field label="Heading" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Our Story" isDark={isDark} /></Field>
        <Field label="Body text" faint={textFaint}><EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Share something meaningful..." rows={5} isDark={isDark} /></Field>
        <div className="grid grid-cols-1 gap-2">
          <Field label="Button label" faint={textFaint}><EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })} placeholder="Learn More" isDark={isDark} /></Field>
          <Field label="Button link" faint={textFaint}>
            <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="/products" isDark={isDark} pages={pages} />
          </Field>
        </div>
        <UploadOnlyImageField label="Image" value={section.image ?? ""} onChange={v => onChange({ image: v || undefined })} onUpload={() => triggerUpload("image")} isUploading={uploadingKey === "image"} isDark={isDark} previewHeight={120} />
        <div className={`space-y-2 pt-1`}>
          <Field label="Desktop — image position" faint={textFaint}>
            <div className="flex gap-2">
              {(["left", "right"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.image_position ?? "left") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                  🖥 Image {pos}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Mobile — image position" faint={textFaint}>
            <div className="flex gap-2">
              {(["top", "bottom"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ mobile_image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.mobile_image_position ?? "top") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                  📱 Image {pos}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </>)}

      {/* ── VIDEO WITH TEXT ───────────────────────────────────────────── */}
      {section.type === "video_text" && (<>
        <Field label="Heading" faint={textFaint}><EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Watch & Shop" isDark={isDark} /></Field>
        <Field label="Body text" faint={textFaint}><EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Tell your audience what this video is about..." rows={4} isDark={isDark} /></Field>
        <div className="grid grid-cols-1 gap-2">
          <Field label="Button label" faint={textFaint}><EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })} placeholder="Shop Now" isDark={isDark} /></Field>
          <Field label="Button link" faint={textFaint}>
            <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="/products" isDark={isDark} pages={pages} />
          </Field>
        </div>
        <Field label="Video URL" faint={textFaint}>
          <EditorInput value={section.video_text_url ?? ""} onChange={v => onChange({ video_text_url: v })} placeholder="https://youtube.com/watch?v=... or https://youtu.be/..." isDark={isDark} />
          <p className={`text-[10px] mt-1 ${textFaint} opacity-60`}>YouTube and Vimeo supported</p>
        </Field>
        <div className="pt-1 space-y-2">
          <Field label="Desktop — video side" faint={textFaint}>
            <div className="flex gap-2">
              {(["left", "right"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.image_position ?? "left") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                  🖥 Video {pos}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Mobile — video position" faint={textFaint}>
            <div className="flex gap-2">
              {(["top", "bottom"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ mobile_image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.mobile_image_position ?? "top") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                  📱 Video {pos}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </>)}

      {/* ── FEATURED PRODUCT ─────────────────────────────────────────── */}
      {section.type === "featured_product" && (() => {
        const selectedProduct = products.find(p => p.id === section.featured_product_id) ?? null
        const showTitle  = section.featured_product_show_title  !== false
        const showPrice  = section.featured_product_show_price  !== false
        const showColors = section.featured_product_show_colors !== false

        return (<>
          {/* Section label above */}
          <Field label="Section label (shown above image)" faint={textFaint}>
            <EditorInput value={section.title ?? ""} onChange={v => onChange({ title: v })} placeholder="Fan Favourite" isDark={isDark} />
          </Field>

          {/* Product dropdown */}
          <Field label="Select product" faint={textFaint}>
            <ProductPickerButton
              products={products}
              selectedProduct={selectedProduct}
              onSelect={(p) => onChange({
                featured_product_id: p.id,
                cta_url: `/${vendorHandle}/products/${p.handle}`,
              })}
              onClear={() => onChange({ featured_product_id: undefined, cta_url: "" })}
              isDark={isDark}
              textFaint={textFaint}
            />
          </Field>

          {/* Show/hide toggles for product info under image */}
          <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Product info under image</p>
            <div className="space-y-2">
              {[
                { key: "featured_product_show_title",  label: "Show product title",  val: showTitle },
                { key: "featured_product_show_price",  label: "Show product price",  val: showPrice },
                { key: "featured_product_show_colors", label: "Show color variants", val: showColors },
              ].map(({ key, label, val }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative shrink-0" onClick={() => onChange({ [key]: !val })}>
                    <div className={`w-8 h-4 rounded-full transition-colors ${val ? "bg-orange-500" : "bg-gray-600"}`} />
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                  </div>
                  <span className={`text-xs ${textFaint === "text-gray-500" ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text side content */}
          <div className={`pt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Text side content</p>
            <div className="space-y-2">
              <Field label="Heading" faint={textFaint}>
                <EditorInput value={section.featured_product_heading ?? ""} onChange={v => onChange({ featured_product_heading: v })} placeholder="e.g. The one everyone's talking about" isDark={isDark} />
              </Field>
              <Field label="Description / story" faint={textFaint}>
                <EditorTextarea value={section.text ?? ""} onChange={v => onChange({ text: v })} placeholder="Describe why this product is special..." rows={4} isDark={isDark} />
              </Field>
            </div>
          </div>

          {/* CTA */}
          {/* <div className="grid grid-cols-1 gap-2">
            <Field label="Button label" faint={textFaint}>
              <EditorInput value={section.cta_label ?? ""} onChange={v => onChange({ cta_label: v })} placeholder="Get Yours" isDark={isDark} />
            </Field>
            <Field label="Button link" faint={textFaint}>
              
              <div className="space-y-1">
                <LinkInput value={section.cta_url ?? ""} onChange={v => onChange({ cta_url: v })} placeholder="/products/..." isDark={isDark} pages={pages} />
                {selectedProduct && section.cta_url !== `/${vendorHandle}/products/${selectedProduct.handle}` && (
                  <button onClick={() => onChange({ cta_url: `/${vendorHandle}/products/${selectedProduct.handle}` })}
                    className={`text-[10px] ${textFaint} hover:text-orange-400 transition-colors`}>
                    ↩ Reset to product page
                  </button>
                )}
              </div>
            </Field>
          </div> */}

          {/* Layout */}
          <Field label="Product image side" faint={textFaint}>
            <div className="flex gap-2">
              {(["left", "right"] as const).map(pos => (
                <button key={pos} onClick={() => onChange({ image_position: pos })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${(section.image_position ?? "right") === pos ? "bg-orange-600/20 border-orange-500/50 text-orange-400" : `${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500"}`}`}>
                  Image {pos}
                </button>
              ))}
            </div>
          </Field>
        </>)
      })()}

      {/* ── HEADER NAV EDITOR ────────────────────────────────────────── */}
      {section.type === "header" && (<>
        {/* ── Logo size ── */}
        <StyleSection title="Logo Size" isDark={isDark}>
          <div className="space-y-3">
            <Field label={`Desktop size — ${section.logo_size_desktop ?? 36}px`} faint={textFaint}>
              <input type="range" min={20} max={80} step={2}
                value={section.logo_size_desktop ?? 36}
                onChange={e => onChange({ logo_size_desktop: Number(e.target.value) })}
                className="w-full accent-orange-500" />
              <div className={`flex justify-between text-[9px] mt-0.5 ${textFaint}`}>
                <span>20px</span><span>80px</span>
              </div>
            </Field>
            <Field label={`Mobile size — ${section.logo_size_mobile ?? 28}px`} faint={textFaint}>
              <input type="range" min={16} max={46} step={2}
                value={section.logo_size_mobile ?? 28}
                onChange={e => onChange({ logo_size_mobile: Number(e.target.value) })}
                className="w-full accent-orange-500" />
              <div className={`flex justify-between text-[9px] mt-0.5 ${textFaint}`}>
                <span>16px</span><span>46px</span>
              </div>
            </Field>
            {/* Live preview */}
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              {storeLogo ? (
                <img src={storeLogo} alt="logo preview"
                  style={{ height: 36 }}
                  className="object-contain w-auto" />
              ) : (
                <span className={`font-bold truncate`}
                  style={{ fontSize: Math.max(12, (section.logo_size_desktop ?? 36) * 0.4) }}>
                  {vendorHandle}
                </span>
              )}
              <span className={`text-[10px] ${textFaint}`}>Desktop preview</span>
            </div>
          </div>
        </StyleSection>

        <NavItemsEditor
          label="Header navigation"
          items={section.nav_items ?? []}
          onChange={items => onChange({ nav_items: items })}
          isDark={isDark}
          pages={pages}
          textFaint={textFaint}
          textPrimary={textPrimary}
          collections={collections}
          categories={categories}
          products={products}
        />
      </>)}

      {/* ── FOOTER NAV EDITOR ────────────────────────────────────────── */}
       {section.type === "footer" && (<>
        <StyleSection title="Footer Logo Size" isDark={isDark}>
          <div className="space-y-3">
            <Field label={`Desktop — ${section.footer_logo_size_desktop ?? 36}px`} faint={textFaint}>
              <input type="range" min={20} max={120} step={2}
                value={section.footer_logo_size_desktop ?? 36}
                onChange={e => onChange({ footer_logo_size_desktop: Number(e.target.value) })}
                className="w-full accent-orange-500" />
              <div className={`flex justify-between text-[9px] mt-0.5 ${textFaint} opacity-60`}>
                <span>20px</span><span>120px</span>
              </div>
            </Field>
            <Field label={`Mobile — ${section.footer_logo_size_mobile ?? 28}px`} faint={textFaint}>
              <input type="range" min={16} max={80} step={2}
                value={section.footer_logo_size_mobile ?? 28}
                onChange={e => onChange({ footer_logo_size_mobile: Number(e.target.value) })}
                className="w-full accent-orange-500" />
              <div className={`flex justify-between text-[9px] mt-0.5 ${textFaint} opacity-60`}>
                <span>16px</span><span>80px</span>
              </div>
            </Field>
             <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              {storeLogo ? (
                <img src={storeLogo} alt="preview"
                  style={{ height: 32 }}
                  className="object-contain w-auto max-w-[120px]" />
              ) : (
                <span className={`font-bold text-sm ${textPrimary}`}>
                  {vendorHandle}
                </span>
              )}
              <span className={`text-[9px] ${textFaint} opacity-60 ml-auto`}>
                {section.footer_logo_size_desktop ?? 36}px desktop · {section.footer_logo_size_mobile ?? 28}px mobile
              </span>
            </div>
          </div>
        </StyleSection>

         <FooterColumnsEditor
          columns={section.footer_columns ?? getDefaultFooterColumns(collections, categories, pages, { instagram_url: store?.instagram_url, youtube_url: store?.youtube_url, twitter_url: store?.twitter_url, facebook_url: store?.facebook_url, tiktok_url: store?.tiktok_url })}
          onChange={cols => onChange({ footer_columns: cols })}
          columnsPerRow={section.footer_columns_per_row ?? 4}
          onColumnsPerRowChange={n => onChange({ footer_columns_per_row: n })}
          columnsPerRowMobile={section.footer_columns_per_row_mobile ?? 2}
          onColumnsPerRowMobileChange={n => onChange({ footer_columns_per_row_mobile: n })}
          isDark={isDark}
          pages={pages}
          textFaint={textFaint}
          textPrimary={textPrimary}
        />
      </>)}

      {section.type === "collection_products" && (<>
  <Field label="Page heading" faint={textFaint}>
    <EditorInput
      value={section.title ?? "Products"}
      onChange={v => onChange({ title: v })}
      placeholder="Products"
      isDark={isDark}
    />
  </Field>

  <Field label="Columns" faint={textFaint}>
    <div className="grid grid-cols-3 gap-1">
      {([2, 3, 4] as const).map(n => (
        <button key={n} onClick={() => onChange({ columns: n })}
          className={`py-1.5 rounded-lg border text-xs transition-all ${
            (section.columns ?? 3) === n
              ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
              : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
          }`}>{n}</button>
      ))}
    </div>
  </Field>

  <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
    <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section Colors</p>
    <div className="grid grid-cols-2 gap-2">
      <Field label="Background" faint={textFaint}>
        <div className="space-y-1.5">
          {section.background_color ? (
            <div className="flex gap-1.5 items-center">
              <input type="color" value={section.background_color}
                onChange={e => onChange({ background_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <input type="text" value={section.background_color}
                onChange={e => onChange({ background_color: e.target.value })}
                className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                  isDark ? "bg-gray-800 border border-gray-700 text-gray-200"
                         : "bg-white border border-gray-300 text-gray-800"
                }`} />
              <button onClick={() => onChange({ background_color: undefined })}
                className="text-red-400 shrink-0 hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button onClick={() => onChange({ background_color: "#ffffff" })}
              className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                       : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
              }`}>
              <Plus className="w-3 h-3" />Set color
            </button>
          )}
        </div>
      </Field>
      <Field label="Text" faint={textFaint}>
        <div className="space-y-1.5">
          {section.text_color ? (
            <div className="flex gap-1.5 items-center">
              <input type="color" value={section.text_color}
                onChange={e => onChange({ text_color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
              <input type="text" value={section.text_color}
                onChange={e => onChange({ text_color: e.target.value })}
                className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                  isDark ? "bg-gray-800 border border-gray-700 text-gray-200"
                         : "bg-white border border-gray-300 text-gray-800"
                }`} />
              <button onClick={() => onChange({ text_color: undefined })}
                className="text-red-400 shrink-0 hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button onClick={() => onChange({ text_color: "#111827" })}
              className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                       : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
              }`}>
              <Plus className="w-3 h-3" />Set color
            </button>
          )}
        </div>
      </Field>
    </div>
  </div>
</>)}

      {/* ── CATEGORY GRID ── */}
      {section.type === "category_grid" && (<>
      <Field label="Page heading" faint={textFaint}>
        <EditorInput
          value={section.title ?? "Categories"}
          onChange={v => onChange({ title: v })}
          placeholder="Categories"
          isDark={isDark}
        />
      </Field>
      <Field label="Columns" faint={textFaint}>
        <div className="grid grid-cols-4 gap-1">
          {([2, 3, 4, 5] as const).map(n => (
            <button key={n} onClick={() => onChange({ columns: n })}
              className={`py-1.5 rounded-lg border text-xs transition-all ${
                (section.columns ?? 4) === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
              }`}>{n}</button>
          ))}
        </div>
      </Field>

      {/* Colors — inline since this is a virtual section type */}
      <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section Colors</p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Background" faint={textFaint}>
            <div className="space-y-1.5">
              {section.background_color ? (
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button onClick={() => onChange({ background_color: undefined })}
                    className="text-red-400 shrink-0 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => onChange({ background_color: "#ffffff" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>

          <Field label="Text" faint={textFaint}>
            <div className="space-y-1.5">
              {section.text_color ? (
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0" />
                  <input type="text" value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`} />
                  <button onClick={() => onChange({ text_color: undefined })}
                    className="text-red-400 shrink-0 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => onChange({ text_color: "#111827" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}>
                  <Plus className="w-3 h-3" />Set color
                </button>
              )}
            </div>
          </Field>
        </div>
      </div>
    </>)} 

      {/* ── SECTION COLORS OVERRIDE (all except announcement, divider, html, ticker) ── */}
      {!["announcement", "divider", "html", "ticker", "category_grid", "category_products", "collections_grid", "collection_products"].includes(section.type) && (
      <div className={`pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <p className={`text-[10px] ${textFaint} mb-2 uppercase tracking-wider`}>Section colors override</p>
        <div className="grid grid-cols-2 gap-2">
          
          {/* Background */}
          <Field label="Background" faint={textFaint}>
            <div className="space-y-1.5">
              {section.background_color ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={section.background_color}
                    onChange={e => onChange({ background_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`}
                  />
                  <button
                    onClick={() => onChange({ background_color: undefined })}
                    className="text-red-400 transition-colors shrink-0 hover:text-red-300"
                    title="Remove override"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onChange({ background_color: "#ffffff" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Set color
                </button>
              )}
            </div>
          </Field>

          {/* Text */}
          <Field label="Text" faint={textFaint}>
            <div className="space-y-1.5">
              {section.text_color ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    type="color"
                    value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className="w-7 h-7 rounded border border-gray-700 cursor-pointer bg-transparent p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={section.text_color}
                    onChange={e => onChange({ text_color: e.target.value })}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-orange-500 ${
                      isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800"
                    }`}
                  />
                  <button
                    onClick={() => onChange({ text_color: undefined })}
                    className="text-red-400 transition-colors shrink-0 hover:text-red-300"
                    title="Remove override"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onChange({ text_color: "#000000" })}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed text-xs transition-colors ${
                    isDark
                      ? "border-gray-700 text-gray-500 hover:border-orange-500/50 hover:text-orange-400"
                      : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Set color
                </button>
              )}
            </div>
          </Field>

        </div>
      </div>
    )}
    </div>
  )
}

function getDefaultFooterColumns(
  collections: { id: string; title: string; handle: string }[],
  categories: { id: string; name: string; handle: string; product_count: number }[],
  pages: StorePage[],
  store?: VendorStore
): FooterColumn[] {
  const followItems = [
    store?.instagram_url ? { id: "f_ig",  label: "Instagram",  url: store.instagram_url } : null,
    store?.youtube_url   ? { id: "f_yt",  label: "YouTube",    url: store.youtube_url   } : null,
    store?.twitter_url   ? { id: "f_tw",  label: "Twitter / X", url: store.twitter_url  } : null,
    store?.facebook_url  ? { id: "f_fb",  label: "Facebook",   url: store.facebook_url  } : null,
    store?.tiktok_url    ? { id: "f_tt",  label: "TikTok",     url: store.tiktok_url    } : null,
  ].filter(Boolean) as NavItem[]

   const cols = [
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

  // Deduplicate by heading before returning
  const seen = new Set<string>()
  return cols.filter(c => {
    const key = c.heading.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function FooterColumnsEditor({ columns, onChange, columnsPerRow, onColumnsPerRowChange, columnsPerRowMobile, onColumnsPerRowMobileChange, isDark, pages, textFaint, textPrimary }: {
  columns: FooterColumn[]
  onChange: (cols: FooterColumn[]) => void
  columnsPerRow: number
  onColumnsPerRowChange: (n: number) => void
  columnsPerRowMobile: number
  onColumnsPerRowMobileChange: (n: number) => void
  isDark: boolean
  pages: StorePage[]
  textFaint: string
  textPrimary: string
}) {
  const [expandedColId, setExpandedColId] = useState<string | null>(null)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [draggingColId, setDraggingColId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<number | null>(null)
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<number | null>(null)
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"

  const addColumn = () => {
    onChange([...columns, { id: genId(), heading: "New Column", items: [] }])
  }

  const updateColumn = (id: string, patch: Partial<FooterColumn>) => {
    onChange(columns.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  const removeColumn = (id: string) => {
    onChange(columns.filter(c => c.id !== id))
    if (expandedColId === id) setExpandedColId(null)
  }

  const moveColumn = (id: string, dir: "up" | "down") => {
    const arr = [...columns]
    const i = arr.findIndex(c => c.id === id)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange(arr)
  }

  const addItem = (colId: string) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: [...col.items, { id: genId(), label: "New Link", url: "/" }] })
  }

  const updateItem = (colId: string, itemId: string, patch: Partial<NavItem>) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: col.items.map(it => it.id === itemId ? { ...it, ...patch } : it) })
  }

  const removeItem = (colId: string, itemId: string) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    updateColumn(colId, { items: col.items.filter(it => it.id !== itemId) })
    if (expandedItemId === itemId) setExpandedItemId(null)
  }

  const moveItem = (colId: string, itemId: string, dir: "up" | "down") => {
    const col = columns.find(c => c.id === colId)
    if (!col) return
    const arr = [...col.items]
    const i = arr.findIndex(it => it.id === itemId)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    updateColumn(colId, { items: arr })
  }

  const DropLine = ({ index }: { index: number }) => {
    const fromIdx = columns.findIndex(c => c.id === draggingColId)
    const isAdjacentBelow = fromIdx === index - 1
    const isItself = fromIdx === index
    const show = !!draggingColId && dragOverColId === index && !isAdjacentBelow && !isItself
    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragOverColId(index) }}
        className={`transition-all duration-150 overflow-hidden ${show ? "h-2 my-0.5" : "h-0 my-0"}`}
      >
        <div className="flex items-center h-full gap-1 px-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
          <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
          <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
        </div>
      </div>
    )
  }

  const ItemDropLine = ({ colId, index }: { colId: string; index: number }) => {
    const col = columns.find(c => c.id === colId)
    if (!col) return null
    const fromIdx = col.items.findIndex(it => it.id === draggingItemId)
    const isAdjacentBelow = fromIdx === index - 1
    const isItself = fromIdx === index
    const show = !!draggingItemId && dragOverItemId === index && !isAdjacentBelow && !isItself
    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragOverItemId(index) }}
        className={`transition-all duration-150 overflow-hidden ${show ? "h-2 my-0.5" : "h-0 my-0"}`}
      >
        <div className="flex items-center h-full gap-1 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <div className="flex-1 h-0.5 bg-blue-400 rounded-full" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Columns per row — desktop */}
      <div className={`p-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textFaint}`}>Columns per row (desktop)</p>
        <div className="grid grid-cols-5 gap-1">
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => onColumnsPerRowChange(n)}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                columnsPerRow === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {n}
            </button>
          ))}
        </div>
        <p className={`text-[9px] mt-1.5 ${textFaint} opacity-60`}>Mobile always stacks to 2 columns</p>
      </div>

      {/* Columns per row — mobile */}
      <div className={`p-2.5 rounded-xl border ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textFaint}`}>Columns per row (mobile)</p>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => onColumnsPerRowMobileChange(n)}
              className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                columnsPerRowMobile === n
                  ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                  : isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {n}
            </button>
          ))}
        </div>
        <p className={`text-[9px] mt-1.5 ${textFaint} opacity-60`}>1 = full width stacked, 2 = side by side, 3 = compact</p>
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>Footer columns</p>
        <span className={`text-[10px] ${textFaint}`}>{columns.length} column{columns.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Columns list with drop indicators */}
      <div
        onDragOver={e => e.preventDefault()}
        onDragEnd={() => { setDraggingColId(null); setDragOverColId(null) }}
        className="space-y-2"
      >
        {/* Drop line before first column */}
        <DropLine index={0} />

        {columns.map((col, ci) => {
          const isColExpanded = expandedColId === col.id

          return (
            <div key={col.id}>
              <div
                draggable
                onDragStart={e => { e.stopPropagation(); setDraggingColId(col.id) }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverColId(ci) }}
                onDrop={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!draggingColId || draggingColId === col.id) return
                  const arr = [...columns]
                  const fromIdx = arr.findIndex(c => c.id === draggingColId)
                  if (fromIdx === -1 || dragOverColId === null) return
                  const [moved] = arr.splice(fromIdx, 1)
                  const insertAt = dragOverColId > fromIdx ? dragOverColId - 1 : dragOverColId
                  arr.splice(insertAt, 0, moved)
                  onChange(arr)
                  setDraggingColId(null)
                  setDragOverColId(null)
                }}
                className={`rounded-xl border overflow-hidden transition-all cursor-grab active:cursor-grabbing select-none ${
                  draggingColId === col.id ? "opacity-40 scale-[0.98]" : ""
                } ${
                  isColExpanded
                    ? isDark ? "border-orange-500/40 bg-gray-800/80" : "border-orange-400/40 bg-orange-50/20"
                    : isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* ── Column header row ── */}
                <div className="flex items-center gap-1.5 px-2 py-2">
                  <GripVertical className={`w-3 h-3 shrink-0 transition-colors ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`} />
                  <button
                    onClick={() => setExpandedColId(isColExpanded ? null : col.id)}
                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                  >
                    <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isColExpanded ? "rotate-90" : ""} ${textFaint}`} />
                    <span className={`text-xs font-semibold truncate ${textPrimary}`}>{col.heading}</span>
                  </button>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"}`}>
                    {col.items.length} links
                  </span>
                  <button onClick={e => { e.stopPropagation(); moveColumn(col.id, "up") }} disabled={ci === 0}
                    className={`p-0.5 rounded ${ci === 0 ? "opacity-30" : hoverBg} ${textFaint}`}>
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); moveColumn(col.id, "down") }} disabled={ci === columns.length - 1}
                    className={`p-0.5 rounded ${ci === columns.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); removeColumn(col.id) }} className="p-0.5 rounded hover:bg-red-900/30">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>

                {/* ── Column expanded content ── */}
                {isColExpanded && (
                  <div className={`border-t ${isDark ? "border-gray-700" : "border-orange-200/60"}`}>

                    {/* Heading edit */}
                    <div className="px-2 pt-2 pb-2">
                      <label className={`text-[10px] ${textFaint} block mb-1`}>Column heading</label>
                      <input
                        value={col.heading}
                        onChange={e => updateColumn(col.id, { heading: e.target.value })}
                        placeholder="e.g. Shop"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500 border ${
                          isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>

                    {/* Links list */}
                    <div className={`mx-2 mb-2 rounded-lg border overflow-hidden ${isDark ? "border-gray-700 bg-gray-900/40" : "border-gray-200 bg-white"}`}>
                      <p className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider border-b ${isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-100"}`}>
                        Links
                      </p>
                      <div
                        className="p-1.5 space-y-1.5"
                        onDragEnd={() => { setDraggingItemId(null); setDragOverItemId(null) }}
                      >
                        {col.items.length === 0 && (
                          <p className={`text-[10px] italic px-1 py-1 ${textFaint}`}>No links yet.</p>
                        )}

                        {/* Drop line before first item */}
                        <ItemDropLine colId={col.id} index={0} />

                        {col.items.map((item, ii) => {
                          const colId = col.id
                          const isItemExpanded = expandedItemId === item.id

                          return (
                            <div key={item.id}>
                              <div
                                draggable
                                onDragStart={e => { e.stopPropagation(); setDraggingItemId(item.id) }}
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(ii) }}
                                onDrop={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (!draggingItemId || draggingItemId === item.id) return
                                  const currentCol = columns.find(c => c.id === colId)
                                  if (!currentCol) return
                                  const arr = [...currentCol.items]
                                  const fromIdx = arr.findIndex(it => it.id === draggingItemId)
                                  if (fromIdx === -1 || dragOverItemId === null) return
                                  const [moved] = arr.splice(fromIdx, 1)
                                  const insertAt = dragOverItemId > fromIdx ? dragOverItemId - 1 : dragOverItemId
                                  arr.splice(insertAt, 0, moved)
                                  updateColumn(colId, { items: arr })
                                  setDraggingItemId(null)
                                  setDragOverItemId(null)
                                }}
                                className={`rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all ${
                                  draggingItemId === item.id ? "opacity-40 scale-[0.98]" : ""
                                } ${
                                  isItemExpanded
                                    ? isDark ? "border-orange-500/30 bg-gray-800" : "border-orange-300/40 bg-orange-50/30"
                                    : isDark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-gray-50"
                                }`}
                              >
                                {/* Item row */}
                                <div className="flex items-center gap-1.5 px-2 py-1.5">
                                  <GripVertical className={`w-2.5 h-2.5 shrink-0 transition-colors ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`} />
                                  <button
                                    onClick={() => setExpandedItemId(isItemExpanded ? null : item.id)}
                                    className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
                                  >
                                    <ChevronRight className={`w-2.5 h-2.5 shrink-0 transition-transform ${isItemExpanded ? "rotate-90" : ""} ${textFaint}`} />
                                    <span className={`text-[11px] font-medium truncate ${textPrimary}`}>{item.label || "Untitled"}</span>
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); moveItem(colId, item.id, "up") }} disabled={ii === 0}
                                    className={`p-0.5 rounded ${ii === 0 ? "opacity-30" : hoverBg} ${textFaint}`}>
                                    <ChevronUp className="w-2.5 h-2.5" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); moveItem(colId, item.id, "down") }} disabled={ii === col.items.length - 1}
                                    className={`p-0.5 rounded ${ii === col.items.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}>
                                    <ChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); removeItem(colId, item.id) }} className="p-0.5 rounded hover:bg-red-900/30">
                                    <Trash2 className="w-2.5 h-2.5 text-red-400" />
                                  </button>
                                </div>

                                {/* Item expanded fields */}
                                {isItemExpanded && (
                                  <div className={`px-2 pb-2 space-y-1.5 border-t ${isDark ? "border-gray-700" : "border-orange-200/40"}`}>
                                    <div className="pt-1.5">
                                      <label className={`text-[10px] ${textFaint} block mb-1`}>Label</label>
                                      <input
                                        value={item.label}
                                        onChange={e => updateItem(colId, item.id, { label: e.target.value })}
                                        placeholder="e.g. All Products"
                                        className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-500 border ${
                                          isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-800"
                                        }`}
                                      />
                                    </div>
                                    <div>
                                      <label className={`text-[10px] ${textFaint} block mb-1`}>Link</label>
                                      <LinkInput
                                        value={item.url}
                                        onChange={v => updateItem(colId, item.id, { url: v })}
                                        placeholder="/products"
                                        isDark={isDark}
                                        pages={pages}
                                      />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <div className="relative shrink-0" onClick={() => updateItem(colId, item.id, { external: !item.external })}>
                                        <div className={`w-7 h-3.5 rounded-full transition-colors ${item.external ? "bg-orange-500" : "bg-gray-600"}`} />
                                        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${item.external ? "translate-x-3.5" : ""}`} />
                                      </div>
                                      <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                                    </label>
                                  </div>
                                )}
                              </div>

                              {/* Drop line after each item */}
                              <ItemDropLine colId={col.id} index={ii + 1} />
                            </div>
                          )
                        })}

                        <button onClick={() => addItem(col.id)}
                          className={`w-full flex items-center justify-center gap-1 py-1 mt-1 rounded-lg border border-dashed text-[10px] transition-all ${
                            isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/40 hover:text-orange-400" : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                          }`}>
                          <Plus className="w-2.5 h-2.5" />Add link
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Drop line after each column */}
              <DropLine index={ci + 1} />
            </div>
          )
        })}
      </div>

      <button onClick={addColumn}
        className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed text-xs transition-all ${
          isDark ? "border-gray-700 text-gray-400 hover:border-orange-500/40 hover:text-orange-400" : "border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-500"
        }`}>
        <Plus className="w-3 h-3" />Add column
      </button>
    </div>
  )
}

// ─── NavItemsEditor — Shopify-style nav editor ─────────────────────────────────

function NavItemsEditor({ label, items, onChange, isDark, pages, textFaint, textPrimary, collections = [], categories = [], products = [] }: {
  label: string
  items: NavItem[]
  onChange: (items: NavItem[]) => void
  isDark: boolean
  pages: StorePage[]
  textFaint: string
  textPrimary: string
  collections?: { id: string; title: string; handle: string }[]
  categories?: { id: string; name: string; handle: string; product_count: number }[]
  products?: { id: string; title: string; handle: string; thumbnail?: string }[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null)
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
  const vendorCollections = collections
  const vendorCategories  = categories
  const vendorProducts    = products

  const addItem = () => {
    const newId = genId()
    onChange([...items, { id: newId, label: "New Link", url: "" }])
    setExpandedId(newId)
  }

  const updateItem = (id: string, patch: Partial<NavItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  const removeItem = (id: string) => {
    onChange(items.filter(it => it.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const moveItem = (id: string, dir: "up" | "down") => {
    const arr = [...items]
    const i = arr.findIndex(it => it.id === id)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onChange(arr)
  }

  const addChild = (parentId: string) => {
    updateItem(parentId, {
      children: [...(items.find(it => it.id === parentId)?.children ?? []), { id: genId(), label: "Sub Link", url: "/" }]
    })
  }

  const updateChild = (parentId: string, childId: string, patch: Partial<NavItem>) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    updateItem(parentId, {
      children: (parent.children ?? []).map(c => c.id === childId ? { ...c, ...patch } : c)
    })
  }

  const removeChild = (parentId: string, childId: string) => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    updateItem(parentId, {
      children: (parent.children ?? []).filter(c => c.id !== childId)
    })
    if (expandedChildId === childId) setExpandedChildId(null)
  }

  const moveChild = (parentId: string, childId: string, dir: "up" | "down") => {
    const parent = items.find(it => it.id === parentId)
    if (!parent) return
    const arr = [...(parent.children ?? [])]
    const i = arr.findIndex(c => c.id === childId)
    const swap = dir === "up" ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    updateItem(parentId, { children: arr })
  }

  // An item is "truly invalid" only when it's a brand new untouched item
  const isItemInvalid = (it: NavItem) =>
    (!it.url?.trim() || it.url === "#") &&
    (!it.children || it.children.length === 0) &&
    (it.label === "New Link" || it.label === "Untitled" || !it.label)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${textFaint}`}>{label}</p>
        <span className={`text-[10px] ${textFaint}`}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 && (
        <p className={`text-[11px] italic py-2 ${textFaint}`}>No nav items yet. Add one below.</p>
      )}

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isExpanded = expandedId === item.id
          const children = item.children ?? []
          const invalid = isItemInvalid(item)

          return (
            <div key={item.id} className={`rounded-xl border overflow-hidden transition-all ${
              isExpanded
                ? isDark ? "border-orange-500/40 bg-gray-800/80" : "border-orange-400/40 bg-orange-50/30"
                : isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
            }`}>

              {/* ── Parent header row ── */}
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <GripVertical className={`w-3 h-3 shrink-0 ${textFaint}`} />
                {children.length > 0 && (
                  <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""} ${textFaint}`} />
                )}
                <span className={`flex-1 text-xs font-medium truncate ${textPrimary}`}>
                  {item.label || "Untitled"}
                  {children.length > 0 && (
                    <span className={`ml-1 text-[9px] ${textFaint}`}>({children.length})</span>
                  )}
                </span>
                {/* Red dot only for brand-new untouched items */}
                {invalid && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" title="URL required" />
                )}
                <button onClick={() => moveItem(item.id, "up")} disabled={i === 0}
                  className={`p-0.5 rounded transition-colors ${i === 0 ? "opacity-30" : hoverBg} ${textFaint}`}>
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={() => moveItem(item.id, "down")} disabled={i === items.length - 1}
                  className={`p-0.5 rounded transition-colors ${i === items.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className={`p-0.5 rounded transition-colors ${textFaint} ${hoverBg}`}
                  title={isExpanded ? "Collapse" : "Edit"}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <button onClick={() => removeItem(item.id)} className="p-0.5 rounded hover:bg-red-900/30">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>

              {/* ── Expanded: parent fields + children ── */}
              {isExpanded && (
                <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>

                  <div className="px-3 pt-2 pb-2.5 space-y-2">

                    {/* Label row */}
                    <div>
                      <span className={`text-[10px] font-medium block mb-1 ${textFaint}`}>Label</span>
                      <input
                        value={item.label}
                        onChange={e => updateItem(item.id, { label: e.target.value })}
                        placeholder="e.g. Shop"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 border transition-colors ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                            : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                        }`}
                      />
                    </div>

                    {/* Link row */}
                    <div>
                      <span className={`text-[10px] font-medium block mb-1 ${textFaint}`}>
                        Link <span className="font-normal opacity-50">(optional if has children)</span>
                      </span>
                      <LinkInput
                        value={item.url}
                        onChange={v => updateItem(item.id, { url: v })}
                        placeholder="Search or paste link"
                        isDark={isDark}
                        pages={pages}
                        onLabelSuggest={suggested => {
                          if (!item.label || item.label === "New Link" || item.label === "Sub Link") {
                            updateItem(item.id, { label: suggested })
                          }
                        }}
                      />
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-0.5">
                      {/* External toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative shrink-0" onClick={() => updateItem(item.id, { external: !item.external })}>
                          <div className={`w-7 h-3.5 rounded-full transition-colors ${item.external ? "bg-orange-500" : isDark ? "bg-gray-600" : "bg-gray-300"}`} />
                          <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${item.external ? "translate-x-3.5" : ""}`} />
                        </div>
                        <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                      </label>

                      {/* Confirm + Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { if (!invalid) setExpandedId(null) }}
                          disabled={invalid}
                          title={invalid ? "Enter a URL first" : "Confirm"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            invalid
                              ? "opacity-30 cursor-not-allowed text-gray-400"
                              : isDark ? "text-green-400 hover:bg-green-900/30" : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDark ? "text-gray-500 hover:text-red-400 hover:bg-red-900/20" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Children / Dropdown items */}
                  <div className={`mx-2 mb-2 rounded-lg border ${isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-gray-50/80"}`}>
                    <p className={`px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider border-b ${isDark ? "text-gray-500 border-gray-700" : "text-gray-400 border-gray-200"}`}>
                      Dropdown items
                    </p>
                    <div className="p-1.5 space-y-1">

                      {/* System route: show live data as read-only preview */}
                      {children.length === 0 && ["/collections", "/categories", "/products"].includes(item.url ?? "") && (() => {
                        const isCollections = item.url === "/collections"
                        const isCategories  = item.url === "/categories"
                        const autoItems = isCollections
                          ? vendorCollections.map(c => ({ id: c.id, label: c.title, url: `/collections/${c.handle}` }))
                          : isCategories
                          ? vendorCategories.map(c => ({ id: c.id, label: c.name, url: `/categories/${c.handle}` }))
                          : vendorProducts.slice(0, 8).map(p => ({ id: p.id, label: p.title, url: `/products/${p.handle}` }))

                        return (
                          <>
                            <p className={`text-[9px] px-1 pb-1 ${textFaint} opacity-70`}>
                              Auto-populated · Add items below to override
                            </p>
                            {autoItems.slice(0, 6).map(ai => (
                              <div key={ai.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                                isDark ? "bg-gray-800/60" : "bg-gray-100/80"
                              }`}>
                                <div className={`w-1 h-1 rounded-full shrink-0 ${isDark ? "bg-gray-600" : "bg-gray-400"}`} />
                                <span className={`flex-1 text-[11px] truncate ${textFaint}`}>{ai.label}</span>
                                <span className={`text-[9px] font-mono truncate max-w-[80px] ${textFaint} opacity-60`}>{ai.url}</span>
                              </div>
                            ))}
                            {autoItems.length > 6 && (
                              <p className={`text-[9px] px-1 pt-0.5 ${textFaint} opacity-50`}>
                                +{autoItems.length - 6} more
                              </p>
                            )}
                          </>
                        )
                      })()}

                      {/* Empty state for non-system routes */}
                      {children.length === 0 && !["/collections", "/categories", "/products"].includes(item.url ?? "") && (
                        <p className={`text-[10px] italic px-1 py-1 ${textFaint}`}>No dropdown items yet.</p>
                      )}

                      {children.map((child, ci) => {
                        const isChildExpanded = expandedChildId === child.id
                        return (
                          <div key={child.id} className={`rounded-lg border overflow-hidden ${
                            isChildExpanded
                              ? isDark ? "border-orange-500/30 bg-gray-800" : "border-orange-300/40 bg-orange-50/40"
                              : isDark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white"
                          }`}>
                            <div className="flex items-center gap-1.5 px-2 py-1.5">
                              <GripVertical className={`w-2.5 h-2.5 shrink-0 ${textFaint}`} />
                              <span className={`flex-1 text-[11px] font-medium truncate ${textPrimary}`}>{child.label || "Untitled"}</span>
                              <button onClick={() => moveChild(item.id, child.id, "up")} disabled={ci === 0}
                                className={`p-0.5 rounded ${ci === 0 ? "opacity-30" : hoverBg} ${textFaint}`}>
                                <ChevronUp className="w-2.5 h-2.5" />
                              </button>
                              <button onClick={() => moveChild(item.id, child.id, "down")} disabled={ci === children.length - 1}
                                className={`p-0.5 rounded ${ci === children.length - 1 ? "opacity-30" : hoverBg} ${textFaint}`}>
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setExpandedChildId(isChildExpanded ? null : child.id)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${
                                  isChildExpanded
                                    ? "bg-orange-500/20 text-orange-400"
                                    : isDark ? "bg-gray-700 text-gray-500 hover:bg-gray-600" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}>
                                {isChildExpanded ? "Done" : "Edit"}
                              </button>
                              <button onClick={() => removeChild(item.id, child.id)} className="p-0.5 rounded hover:bg-red-900/30">
                                <Trash2 className="w-2.5 h-2.5 text-red-400" />
                              </button>
                            </div>
                            {isChildExpanded && (
                              <div className={`px-2 pb-2 space-y-1.5 border-t ${isDark ? "border-gray-700" : "border-orange-200/40"}`}>
                                <div className="pt-1.5">
                                  <label className={`text-[10px] ${textFaint} block mb-1`}>Label</label>
                                  <EditorInput value={child.label} onChange={v => updateChild(item.id, child.id, { label: v })} placeholder="e.g. Red Wines" isDark={isDark} />
                                </div>
                                <div>
                                  <label className={`text-[10px] ${textFaint} block mb-1`}>Link</label>
                                  <LinkInput
                                    value={child.url}
                                    onChange={v => updateChild(item.id, child.id, { url: v })}
                                    placeholder="/collections/red-wines"
                                    isDark={isDark}
                                    pages={pages}
                                    onLabelSuggest={suggested => {
                                      if (!child.label || child.label === "Sub Link") {
                                        updateChild(item.id, child.id, { label: suggested })
                                      }
                                    }}
                                  />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <div className="relative shrink-0" onClick={() => updateChild(item.id, child.id, { external: !child.external })}>
                                    <div className={`w-7 h-3.5 rounded-full transition-colors ${child.external ? "bg-orange-500" : "bg-gray-600"}`} />
                                    <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-transform ${child.external ? "translate-x-3.5" : ""}`} />
                                  </div>
                                  <span className={`text-[10px] ${textFaint}`}>Open in new tab</span>
                                </label>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {!["/collections", "/categories", "/products"].includes(item.url ?? "") && (
                        <button onClick={() => addChild(item.id)}
                          className={`w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed text-[10px] transition-all ${
                            isDark ? "border-gray-700 text-gray-500 hover:border-orange-500/40 hover:text-orange-400" : "border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-500"
                          }`}>
                          <Plus className="w-2.5 h-2.5" />Add dropdown item
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )
        })}
      </div>

      {(() => {
        const hasInvalid = items.some(isItemInvalid)
        return hasInvalid ? (
          <div className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs ${
            isDark ? "border-red-800/50 bg-red-900/10 text-red-400" : "border-red-200 bg-red-50 text-red-500"
          }`}>
            <span className="w-3 h-3 rounded-full bg-red-400/20 text-red-400 text-[9px] flex items-center justify-center font-bold">!</span>
            Fill in the URL for existing items first
          </div>
        ) : (
          <button onClick={addItem}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition-all ${
              isDark ? "border-gray-700 border-dashed text-gray-400 hover:border-gray-500 hover:text-gray-300"
                     : "border-gray-300 border-dashed text-gray-500 hover:border-gray-400"
            }`}>
            <Plus className="w-3 h-3" />Add nav item
          </button>
        )
      })()}

      <p className={`text-[10px] ${textFaint} opacity-60`}>
        Tip: Pages marked "Show in header nav" in the Pages tab are added automatically.
      </p>
    </div>
  )
}

function sanitizeRichText(html: string): string {
  if (!html) return ""
  // Strip style attributes (contain Tailwind CSS vars)
  // Strip class attributes
  // Keep only safe tags: b, i, u, s, strong, em, a, br, p, ul, ol, li, span
  const cleaned = html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/<(?!\/?(?:b|i|u|s|strong|em|a|br|p|ul|ol|li|span)(?:\s|>|\/))[^>]+>/gi, "")
  // Check if anything meaningful remains
  const text = cleaned.replace(/<[^>]*>/g, "").trim()
  return text ? cleaned : ""
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

// ─── RichTextEditor — contentEditable with formatting toolbar ────────────────

function RichTextEditor({ value, onChange, placeholder, isDark, rows = 3, singleLine = false, showToolbar }: {
  value: string; onChange: (v: string) => void; placeholder?: string
  isDark: boolean; rows?: number; singleLine?: boolean; showToolbar?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const savedRange = useRef<Range | null>(null)

  // Sync external value → editor HTML (only when not focused to avoid cursor jumps)
  useEffect(() => {
    if (!editorRef.current || focused) return
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value, focused])

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    if (!savedRange.current) return
    const sel = window.getSelection()
    if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current) }
  }

  const insertLink = () => {
    restoreSelection()
    if (linkUrl) execCmd("createLink", linkUrl)
    setShowLinkDialog(false)
    setLinkUrl("")
  }

  const renderToolbar = showToolbar !== undefined ? showToolbar : !singleLine

  const btns: { cmd?: string; val?: string; icon: React.ReactNode; title: string; action?: () => void }[] = [
    { cmd: "bold",        icon: <span className="font-bold text-[11px]">B</span>,       title: "Bold" },
    { cmd: "italic",      icon: <span className="italic text-[11px]">I</span>,           title: "Italic" },
    { cmd: "underline",   icon: <span className="underline text-[11px]">U</span>,        title: "Underline" },
    { cmd: "strikeThrough",icon:<span className="line-through text-[11px]">S</span>,    title: "Strikethrough" },
    { title: "|" },
    { cmd: "insertUnorderedList", icon: <span className="text-[11px]">≡</span>,          title: "Bullet list" },
    { title: "|" },
    { icon: <LinkIcon className="w-2.5 h-2.5" />, title: "Insert link",
      action: () => { saveSelection(); setShowLinkDialog(true) } },
    { cmd: "unlink", icon: <span className="text-[11px] opacity-60 line-through">🔗</span>, title: "Remove link" },
  ]

  const toolbarBg = isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
  const editorBg  = isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
  const minH = singleLine ? "min-h-[34px]" : rows <= 3 ? "min-h-[80px]" : rows <= 6 ? "min-h-[130px]" : "min-h-[200px]"

  return (
    <div className={`rounded-lg border overflow-hidden focus-within:border-orange-500 transition-colors ${isDark ? "border-gray-700" : "border-gray-300"}`}>
      {/* Toolbar */}
      {renderToolbar && (
        <div className={`flex items-center gap-0.5 px-1.5 py-1 border-b ${toolbarBg} flex-wrap`}>
          {btns.map((b, i) => b.title === "|"
            ? <div key={i} className={`w-px h-3.5 mx-0.5 ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />
            : (
              <button key={i} type="button" title={b.title}
                onMouseDown={e => { e.preventDefault(); b.action ? b.action() : b.cmd && execCmd(b.cmd, b.val) }}
                className={`w-5 h-5 flex items-center justify-center rounded transition-colors ${isDark ? "text-gray-300 hover:bg-gray-600 hover:text-white" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}>
                {b.icon}
              </button>
            )
          )}
        </div>
      )}

      {/* Link dialog */}
      {showLinkDialog && (
        <div className={`flex items-center gap-1.5 px-2 py-1.5 border-b ${toolbarBg}`}>
          <LinkIcon className={`w-3 h-3 shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") insertLink(); if (e.key === "Escape") setShowLinkDialog(false) }}
            placeholder="https://..."
            className={`flex-1 text-xs px-1.5 py-1 rounded border focus:outline-none ${isDark ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-800"}`}
          />
          <button type="button" onClick={insertLink} className="text-[10px] px-2 py-1 rounded bg-orange-500 text-white font-medium">Add</button>
          <button type="button" onClick={() => setShowLinkDialog(false)} className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
         onBlur={() => {
          setFocused(false)
          const raw = editorRef.current?.innerHTML ?? ""
          const sanitized = sanitizeRichText(raw)
          onChange(sanitized)
        }}
        onInput={() => {
          const raw = editorRef.current?.innerHTML ?? ""
          const sanitized = sanitizeRichText(raw)
          onChange(sanitized)
        }}
        onKeyDown={e => { if (singleLine && e.key === "Enter") e.preventDefault() }}
        onPaste={e => {
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        data-placeholder={placeholder}
        className={`${minH} px-2.5 py-1.5 text-sm focus:outline-none ${editorBg} empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none`}
        style={{ lineHeight: 1.6 }}
      />
    </div>
  )
}

function StyleSection({ title, isDark, children }: { title: string; isDark: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}>
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}`}>
        <span className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{title}</span>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"} transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

function Field({ label, faint, children }: { label: string; faint: string; children: React.ReactNode }) {
  return <div><label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>{children}</div>
}

// EditorInput now uses RichTextEditor in singleLine mode (bold/italic/link still work via keyboard shortcuts)
function EditorInput({ value, onChange, placeholder, isDark }: { value: string; onChange: (v: string) => void; placeholder?: string; isDark: boolean }) {
  return (
    <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} isDark={isDark} singleLine rows={1} />
  )
}

function EditorTextarea({ value, onChange, placeholder, rows = 3, isDark, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; isDark: boolean; mono?: boolean }) {
  if (mono) {
    // Mono/code fields (HTML editor, CSS) stay as plain textarea
    return (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={`w-full rounded-lg px-2.5 py-1.5 text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none font-mono text-xs ${isDark ? "bg-gray-800 border border-gray-700 text-gray-200" : "bg-white border border-gray-300 text-gray-800 placeholder-gray-400"}`} />
    )
  }
  return (
    <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} isDark={isDark} rows={rows} />
  )
}

// Upload-only image field (no text URL input — Next.js only allows uploaded images)
function UploadOnlyImageField({ label, value, onChange, onUpload, isUploading, isDark, previewHeight = 100 }: {
  label: string; value: string; onChange: (v: string) => void; onUpload: () => void
  isUploading: boolean; isDark: boolean; previewHeight?: number
}) {
  const faint = isDark ? "text-gray-500" : "text-gray-400"
  return (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${faint}`}>{label}</label>
      {value ? (
        <div className="relative overflow-hidden border border-gray-700 rounded-xl" style={{ height: previewHeight }}>
          <img src={value} alt="preview" className="object-cover w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/40 hover:opacity-100">
            <button onClick={onUpload} disabled={isUploading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30 hover:bg-white/30 transition-colors">
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Replace
            </button>
            <button onClick={() => onChange("")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/70 backdrop-blur-sm text-white text-xs font-medium hover:bg-red-500/90 transition-colors">
              <Trash2 className="w-3 h-3" />Remove
            </button>
          </div>
        </div>
      ) : (
        <button onClick={onUpload} disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-colors ${isDark ? "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}>
          {isUploading
            ? <Loader2 className={`w-5 h-5 animate-spin ${faint}`} />
            : <Upload className={`w-5 h-5 ${faint}`} />}
          <span className={`text-xs ${faint}`}>{isUploading ? "Uploading..." : "Click to upload image"}</span>
        </button>
      )}
    </div>
  )
}
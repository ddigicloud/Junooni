import type { SectionType, PageTemplate } from "./types"

export const BRAND = { primary: "#e65100", secondary: "#ac1900" }

export const PAGE_ALLOWED_SECTIONS: Record<string, SectionType[]> = {
  home: [
    "hero", "ticker", "collection", "featured", "featured_collections",
    "featured_product", "about", "text", "image", "image_text", "video",
    "video_text", "social", "links", "html", "divider"
  ],
  products: [
    "hero", "ticker", "text", "image", "image_text", "video", "video_text",
    "html", "divider", "collection"
  ],
  collections: [
    "hero", "ticker", "text", "image", "html", "divider", "featured_collections"
  ],
  collection: [
    "hero", "ticker", "text", "image", "html", "divider", "collection"
  ],
  categories: [
    "hero", "ticker", "text", "image", "image_text", "video", "html",
    "divider", "category_grid"
  ],
  category: [
    "hero", "ticker", "text", "image", "image_text", "video", "html",
    "divider", "collection"
  ],
  product: [
    "featured", "text", "image", "image_text", "video", "video_text",
    "html", "divider", "ticker"
  ],
  cart: ["featured", "text", "html", "divider"],
  search: ["text", "html", "divider"],
  checkout: ["text", "html", "divider"],
}

export const SECTION_CATEGORIES = [
  { id: "layout",   label: "Layout"   },
  { id: "products", label: "Products" },
  { id: "content",  label: "Content"  },
  { id: "advanced", label: "Advanced" },
]

export const PAGE_LAYOUT_META: Record<string, {
  label: string
  icon: string
  path: string
  defaultSections: any[]
  isFixed?: boolean
  systemNote?: string
}> = {
  home: {
    label: "Home", icon: "🏠", path: "/",
    defaultSections: [],
  },
  products: {
    label: "All Products", icon: "🛍️", path: "/products",
    defaultSections: [
      { id: "def_prod_grid", type: "collection", title: "All Products", limit: 48, columns: 3, show_sold_out: true },
    ],
  },
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
    defaultSections: [],
  },
  collection: {
    label: "Collection page", icon: "🗂️", path: "/collections/[handle]",
    defaultSections: [
      // { id: "def_col_grid", type: "collection", title: "Products", limit: 24, columns: 3, show_sold_out: true },
    ],
    systemNote: "Applied to all individual collection pages",
  },
  product: {
    label: "Product page", icon: "👕", path: "/products/[handle]",
    defaultSections: [
      { id: "def_prod_upsell", type: "featured", title: "You might also like", limit: 4, columns: 4 },
    ],
    isFixed: true,
    systemNote: "Product images, variants & Add to Cart are always shown above your sections",
  },
  cart: {
    label: "Cart", icon: "🛒", path: "/cart",
    defaultSections: [
      { id: "def_cart_upsell", type: "featured", title: "Complete your look", limit: 4, columns: 4 },
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
  checkout: {
    label: "Checkout", icon: "💳", path: "/checkout",
    defaultSections: [],
    isFixed: true,
    systemNote: "Checkout form, payment & order summary are always shown above your sections",
  },
}

export const FONTS = [
  { id: "inter",         name: "Inter",            class: "font-sans" },
  { id: "poppins",       name: "Poppins",          class: "font-sans" },
  { id: "playfair",      name: "Playfair Display", class: "font-serif" },
  { id: "dm-sans",       name: "DM Sans",          class: "font-sans" },
  { id: "space-grotesk", name: "Space Grotesk",    class: "font-sans" },
  { id: "nunito",        name: "Nunito",            class: "font-sans" },
  { id: "raleway",       name: "Raleway",           class: "font-sans" },
  { id: "montserrat",    name: "Montserrat",        class: "font-sans" },
]

export const TEMPLATES = [
  { id: "minimal",   name: "Minimal",   desc: "Clean, white"     },
  { id: "bold",      name: "Bold",      desc: "Dark & dramatic"  },
  { id: "editorial", name: "Editorial", desc: "Magazine style"   },
]

export const PAGE_TEMPLATES = [
  { id: "blank"   as PageTemplate, label: "Blank",              icon: "📄", defaultContent: "" },
  { id: "about"   as PageTemplate, label: "About Me",           icon: "📄", defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq"     as PageTemplate, label: "FAQ",                icon: "📄", defaultContent: "## Frequently Asked Questions\n\n**Q: How long does shipping take?**\nA: 5-7 business days.\n\n**Q: Do you ship internationally?**\nA: Yes!" },
  { id: "contact" as PageTemplate, label: "Contact",            icon: "📄", defaultContent: "## Contact Us\n\nReach out at your@email.com\n\nWe typically respond within 24 hours." },
  { id: "links"   as PageTemplate, label: "Links",              icon: "🔗", defaultContent: "" },
  { id: "terms"   as PageTemplate, label: "Terms of Service",   icon: "📄", defaultContent: `## Terms of Service\n\n*Last updated: {{CREATED_DATE}}*\n\nWelcome to **[Your Store Name]**. By accessing or purchasing from our store, you agree to the following terms.\n\n### 1. General\nThese Terms of Service apply to all visitors, users, and customers of [Your Store Name] ("we", "us", or "our").\n\n### 2. Products\nAll products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.\n\n### 3. Orders & Payment\nBy placing an order, you confirm that the information you provide is accurate. We accept payment via the methods listed at checkout. Orders are processed only after payment is confirmed.\n\n### 4. Shipping\nWe ship pan-India. Estimated delivery is 5–10 business days. We are not responsible for delays caused by shipping carriers or customs.\n\n### 5. Returns & Refunds\nPlease refer to our [Returns & Refunds Policy](/pages/returns-refunds) for details.\n\n### 6. Intellectual Property\nAll content on this store — including logos, designs, and product images — is the property of [Your Store Name] and may not be reproduced without written permission.\n\n### 7. Limitation of Liability\nWe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our store or products.\n\n### 8. Contact\nFor any questions, reach us at **[your@email.com]**` },
  { id: "privacy" as PageTemplate, label: "Privacy Policy",     icon: "📄", defaultContent: `## Privacy Policy\n\n*Last updated: {{CREATED_DATE}}*\n\nAt **[Your Store Name]**, your privacy is important to us.\n\n### 1. Information We Collect\n- **Personal information:** Name, email address, shipping address, and phone number when you place an order.\n- **Payment information:** We do not store card details. Payments are processed securely by our payment partner.\n- **Usage data:** Pages visited, browser type, and device information.\n\n### 2. How We Use Your Information\n- To process and fulfil your orders\n- To send order confirmations and shipping updates\n- To respond to customer service queries\n\n### 3. Data Sharing\nWe do not sell your personal information.\n\n### 4. Cookies\nOur store uses cookies to keep your cart and remember preferences.\n\n### 5. Contact\nQuestions? Write to us at **[your@email.com]**` },
  { id: "returns" as PageTemplate, label: "Returns & Refunds",  icon: "📄", defaultContent: `## Returns & Refunds Policy\n\n*Last updated: {{CREATED_DATE}}*\n\n### Eligibility for Returns\n- Items must be returned within **7 days** of delivery.\n- Products must be unused, unwashed, and in original packaging.\n\n### How to Initiate a Return\n1. Email us at **[your@email.com]** with your order number.\n2. Our team will respond within 48 hours with return instructions.\n\n### Refunds\nApproved refunds are processed within **5–7 business days**.\n\n### Contact\nFor any queries, reach us at **[your@email.com]**` },
]

export const BUILTIN_PAGES = [
  { label: "Home",         url: "/" },
  { label: "All Products", url: "/products" },
  { label: "Collections",  url: "/collections" },
  { label: "Categories",   url: "/categories" },
  { label: "Search",       url: "/search" },
  { label: "Checkout",     url: "/checkout" },
]
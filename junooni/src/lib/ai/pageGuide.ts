// src/lib/ai/pageGuide.ts

export interface PageHelp {
  name: string
  description: string
  sections: Array<{
    name: string
    location: string
    does: string
    howTo?: string
  }>
}

const PAGE_GUIDE: Record<string, PageHelp> = {
  dashboard: {
    name: "Dashboard",
    description: "Overview of your store performance — revenue, orders, products at a glance.",
    sections: [
      {
        name: "Today's Revenue",
        location: "Top left card",
        does: "Shows total revenue earned today from all orders.",
      },
      {
        name: "Revenue (Last 5 Orders)",
        location: "Top center card",
        does: "Sum of your 5 most recent orders.",
      },
      {
        name: "Pending Orders",
        location: "Top right card",
        does: "Orders that have been placed and paid but not yet shipped.",
        howTo: "Click 'View All' or go to the Orders tab to manage them.",
      },
      {
        name: "Recent Orders",
        location: "Bottom left section",
        does: "Lists your latest orders with customer name, amount, and status.",
        howTo: "Click on any order to open the full order details.",
      },
      {
        name: "Your Products",
        location: "Bottom right section",
        does: "Shows recently added products with their publish status.",
        howTo: "Click on a product to edit it, or click 'Add Product' to create a new one.",
      },
      {
        name: "Add Product button",
        location: "Top right corner of the page",
        does: "Takes you directly to the product catalog to start designing.",
      },
    ],
  },

  "product-catalog": {
    name: "Product Catalog",
    description: "Browse JUNOONI's library of blank products available for customization. Pick a product to open it in the designer and add your artwork.",
    sections: [
      {
        name: "Category navigation",
        location: "Top navigation bar",
        does: "Filter products by category — All Products, Apparels, Accessories, Home & Living.",
        howTo: "Click a category name or use the dropdown to browse subcategories.",
      },
      {
        name: "Search bar",
        location: "Center of the page, below the heading",
        does: "Search for a specific product type (e.g. 'hoodie', 'tote bag', 'mug').",
      },
      {
        name: "Category filter dropdown",
        location: "Right side of the search bar",
        does: "Filter search results by a specific category.",
      },
      {
        name: "Product grid",
        location: "Below the search bar",
        does: "Shows all available blank products with name and base cost.",
        howTo: "Click any product card to open it in the designer tool.",
      },
      {
        name: "Product count",
        location: "Above the product grid",
        does: "Shows total number of available products and current page range.",
      },
    ],
  },

  designer: {
    name: "Designer / Canvas",
    description: "The design tool where you place your artwork on a blank product. Left sidebar has tabs for Product, Colors, Sizes, Upload, Layers, and Pricing.",
    sections: [
      {
        name: "Product tab",
        location: "Left sidebar — first icon (box)",
        does: "Shows the selected blank product details.",
        howTo: "Click to view product info. To change product, go back to the Product Catalog.",
      },
      {
        name: "Colors tab",
        location: "Left sidebar — second icon (circle)",
        does: "Select which color variants of the product you want to offer.",
        howTo: "Click a color swatch to add it. Selected colors become available variants for customers.",
      },
      {
        name: "Sizes tab",
        location: "Left sidebar — third icon (ruler)",
        does: "Select which sizes to offer (XS, S, M, L, XL, 2XL etc.).",
        howTo: "Toggle sizes on/off. Only selected sizes will be created as variants.",
      },
      {
        name: "Upload tab",
        location: "Left sidebar — fourth icon (upload arrow)",
        does: "Upload your design artwork files.",
        howTo: "Click 'Choose Files' or drag and drop your PNG, JPG, or GIF file (max 10MB each). Your file will appear in the Layers panel once uploaded.",
      },
      {
        name: "Layers tab",
        location: "Left sidebar — fifth icon (layers)",
        does: "Shows all design elements placed on the canvas. Displays print quality (DPI) and dimensions.",
        howTo: "Click a layer to select it on the canvas. Drag layers to reorder (top = front). Check the DPI badge — green means Good quality, yellow means acceptable, red means Poor (increase image resolution).",
      },
      {
        name: "Pricing tab",
        location: "Left sidebar — sixth icon (tag)",
        does: "Set your selling price per variant. Shows cost price and your profit margin.",
        howTo: "Enter your desired selling price. The profit shown is after deducting Qikink production cost. Set price higher than the cost price shown.",
      },
      {
        name: "Canvas area",
        location: "Main center area",
        does: "The live design preview. Drag, resize, and position your uploaded artwork on the product.",
        howTo: "Click your uploaded image to select it. Drag to reposition. Use corner handles to resize. The dashed orange border shows the printable area — keep your design inside it.",
      },
      {
        name: "Print area panels",
        location: "Right side strip — Front, Back, Left Sleeves, Right Sleeves etc.",
        does: "Switch between different print areas of the product.",
        howTo: "Click a panel (e.g. 'Back') to switch the canvas to that area and add a different design there.",
      },
      {
        name: "Design / Preview toggle",
        location: "Top center — two buttons",
        does: "'Design' shows the canvas editor. 'Preview' shows photorealistic mockups of your design on the product.",
        howTo: "Click 'Preview' to see how your product will look to customers before publishing.",
      },
      {
        name: "Import to Store button",
        location: "Top right corner",
        does: "Saves your design and takes you to the Create Product page to fill in title, description, and pricing.",
        howTo: "Click 'Import to Store' once you are happy with your design. You will be taken to the product details form next.",
      },
    ],
  },

  "designer-preview": {
    name: "Designer Preview Mode",
    description: "Photorealistic mockup preview of your design on the product before publishing.",
    sections: [
      {
        name: "Mockup thumbnails",
        location: "Left side strip",
        does: "Shows multiple angle mockups — front, back, side views.",
        howTo: "Click any thumbnail to see that angle in the main preview.",
      },
      {
        name: "Main preview area",
        location: "Center",
        does: "Large view of the selected mockup angle with your design applied.",
      },
      {
        name: "Color selector",
        location: "Below the main preview",
        does: "Switch between the color variants you selected to preview each one.",
      },
      {
        name: "Design button",
        location: "Top center",
        does: "Switch back to the canvas editor if you want to make changes to your design.",
      },
      {
        name: "Import to Store button",
        location: "Top right corner",
        does: "Proceed to the Create Product page to fill in product details and publish.",
        howTo: "Click this when you're satisfied with the design. Next step is filling in the product title, description, and pricing.",
      },
    ],
  },

  "designer-create": {
    name: "Create Custom Product",
    description: "Fill in your product details after completing the design. This is the final step before publishing your product.",
    sections: [
      {
        name: "Product Title",
        location: "Left panel — Basic Information section, first field",
        does: "The name of your product shown to customers. The URL slug is auto-generated from this.",
        howTo: "Type a clear, descriptive name. Example: 'Unisex Oversized Classic T-Shirt'. Avoid generic names.",
      },
      {
        name: "Short Description",
        location: "Left panel — Basic Information section, second field",
        does: "Brief summary shown in product listings and search results.",
        howTo: "Keep it under 160 characters. Mention the key material, fit, and use case.",
      },
      {
        name: "Description",
        location: "Left panel — Basic Information section, rich text editor",
        does: "Full product description shown on the product page. Supports bold, italic, and underline formatting.",
        howTo: "Write 2-4 paragraphs covering material, fit, care, and your brand story. Use bold for key specs.",
      },
      {
        name: "Product Status",
        location: "Right panel — Status & Visibility section, top",
        does: "Controls whether the product is visible to customers.",
        howTo: "Set to 'Published' to make it live immediately, or leave as 'Proposed/Draft' to save without publishing. Draft products are not visible to customers.",
      },
      {
        name: "Product Categories",
        location: "Right panel — Status & Visibility section",
        does: "Assign your product to categories so customers can find it through filters.",
        howTo: "Click the dropdown, search or browse categories, click to select. Click the arrow to navigate into subcategories.",
      },
      {
        name: "Discountable toggle",
        location: "Right panel — Status & Visibility section",
        does: "Controls whether this product can be used in discount campaigns.",
        howTo: "Keep it on (orange) if you want this product to be eligible for promotions.",
      },
      {
        name: "Sales Channels",
        location: "Right panel — Status & Visibility section, bottom",
        does: "Choose where this product is listed — Junooni Marketplace, My Own Store, or both.",
        howTo: "Check 'Junooni Marketplace' to list on junooni.com. Check 'My Own Store' to list on your personal storefront. You can select both.",
      },
      {
        name: "Variants table",
        location: "Left panel — Variants section, scrolled down",
        does: "Shows all size/color combinations with their SKU, Cost Price (what JUNOONI charges you), your selling Price, and Your Profit.",
        howTo: "Edit the Price column for each variant. Your Profit = Price minus Cost Price. Make sure your price is higher than the cost price shown in orange.",
      },
      {
        name: "Bulk Edit toggle",
        location: "Above the variants table",
        does: "Apply the same price to all variants at once instead of editing one by one.",
        howTo: "Toggle 'Enable bulk edit mode' on, set one price, and it applies to all variants simultaneously.",
      },
      {
        name: "Create Product button",
        location: "Top right corner AND bottom right corner",
        does: "Saves and publishes your product based on the status you selected.",
        howTo: "Click 'Create Product' when all fields are filled. If status is 'Published' it goes live immediately. If 'Draft' it saves without publishing.",
      },
      {
        name: "Cancel button",
        location: "Next to Create Product button",
        does: "Discards this product form and goes back. Your design is NOT saved if you cancel.",
        howTo: "Only click Cancel if you want to discard everything and start over.",
      },
    ],
  },

  products: {
    name: "Products",
    description: "View, manage, and publish all your products.",
    sections: [
      {
        name: "Product list",
        location: "Main area",
        does: "Shows all your products with thumbnail, title, price, and status.",
        howTo: "Click any product row to open and edit that product.",
      },
      {
        name: "Add Product button",
        location: "Top right corner",
        does: "Opens the Product Catalog so you can pick a blank product and start designing.",
      },
      {
        name: "Status filter",
        location: "Top of the list",
        does: "Filter products by Published, Draft, or All.",
      },
    ],
  },

  "products/detail": {
    name: "Product Detail / Edit",
    description: "Edit an existing product — update title, description, pricing, images, and status.",
    sections: [
      {
        name: "Basic Information",
        location: "Left panel, top",
        does: "Edit product title, short description, and full description.",
      },
      {
        name: "Product Status",
        location: "Right panel",
        does: "Publish, unpublish, or set to draft.",
        howTo: "Change the dropdown to 'Published' to make it live, or 'Draft' to hide it.",
      },
      {
        name: "Sales Channels",
        location: "Right panel",
        does: "Add or remove the product from Marketplace or Own Store.",
      },
      {
        name: "Variants & Pricing",
        location: "Left panel, scrolled down",
        does: "Edit prices for each size/color variant.",
      },
      {
        name: "Images",
        location: "Left panel — Images section",
        does: "View and manage product mockup images.",
      },
      {
        name: "Save button",
        location: "Top right corner",
        does: "Saves all changes to the product.",
      },
    ],
  },

  orders: {
    name: "Orders",
    description: "View and manage all customer orders for your products.",
    sections: [
      {
        name: "Orders list",
        location: "Main area",
        does: "All orders containing your products, sorted newest first.",
        howTo: "Click any order to see full details including customer info, items, and fulfillment status.",
      },
      {
        name: "Status badges",
        location: "On each order row",
        does: "Shows fulfillment status (Pending, Shipped, Delivered, Cancelled) and payment status (Paid, COD).",
      },
      {
        name: "Pagination",
        location: "Bottom of the list",
        does: "Navigate between pages of orders.",
      },
    ],
  },

  "orders/detail": {
    name: "Order Detail",
    description: "Full details of a single order.",
    sections: [
      {
        name: "Order Summary",
        location: "Top section",
        does: "Shows order ID, date, total amount, and current status.",
      },
      {
        name: "Items",
        location: "Middle section",
        does: "Lists all items in this order that belong to your store, with SKU, variant, quantity, and price.",
      },
      {
        name: "Customer Info",
        location: "Right side panel",
        does: "Customer name, email, and shipping address.",
      },
      {
        name: "Fulfillment Status",
        location: "Right side panel or top badge",
        does: "Shows whether the order has been fulfilled, shipped, or delivered.",
      },
      {
        name: "Revenue Breakdown",
        location: "Bottom of the page",
        does: "Shows your payout for this order after platform fees and product cost deduction.",
      },
    ],
  },

  "my-store": {
    name: "My Store",
    description: "Manage your personal storefront — design, domain, sections, and settings.",
    sections: [
      {
        name: "Store Status toggle",
        location: "Top of the page",
        does: "Switch your store between Draft (hidden), Live (public), and Paused.",
        howTo: "Click the status dropdown and select Live to make your store visible to customers.",
      },
      {
        name: "Template selector",
        location: "Design tab → Template section",
        does: "Choose between Minimal, Bold, and Editorial store layouts.",
        howTo: "Click a template to preview it. Changes apply when you save.",
      },
      {
        name: "Colors & Fonts",
        location: "Design tab → Branding section",
        does: "Set your primary color, secondary color, and font to match your brand.",
      },
      {
        name: "Sections",
        location: "Editor tab → Sections panel",
        does: "Add, remove, and reorder homepage sections like Hero, Featured Products, About, etc.",
        howTo: "Drag sections to reorder. Click a section to edit its content. Toggle visibility with the eye icon.",
      },
      {
        name: "Custom Pages",
        location: "Pages tab",
        does: "Add custom pages like Terms & Conditions, Privacy Policy, Returns Policy.",
        howTo: "Click 'Add Page', give it a title and content, then save. It appears in your store's footer.",
      },
      {
        name: "Collections",
        location: "Collections tab",
        does: "Group your products into collections (e.g. Summer Drop, Hoodies) for easier browsing.",
        howTo: "Click 'Create Collection', name it, then add products to it.",
      },
      {
        name: "Domain",
        location: "Settings tab → Domain section",
        does: "Set your subdomain (handle.junooni.com) or connect a custom domain you own.",
        howTo: "For custom domain: enter your domain, then add the CNAME record shown to your DNS provider. Verification takes up to 24 hours.",
      },
      {
        name: "Password Protection",
        location: "Settings tab → Access section",
        does: "Lock your store with a password — useful while setting it up or for exclusive drops.",
        howTo: "Toggle 'Password Protection' on, set a password, and share it with intended visitors.",
      },
      {
        name: "SEO Settings",
        location: "Settings tab → SEO section",
        does: "Set your store's SEO title and description for search engines.",
      },
    ],
  },

  membership: {
    name: "Membership",
    description: "View and manage your JUNOONI plan — Free, Creator, or Studio.",
    sections: [
      {
        name: "Current Plan",
        location: "Top section",
        does: "Shows your active plan, billing cycle, and next renewal date.",
      },
      {
        name: "Plan comparison",
        location: "Main section",
        does: "Side-by-side comparison of Free, Creator (₹899/mo), and Studio (₹2,499/mo) plans.",
      },
      {
        name: "Upgrade button",
        location: "On each plan card",
        does: "Starts the upgrade flow — select monthly or annual billing, then pay via Razorpay.",
        howTo: "Click 'Upgrade to Creator' or 'Upgrade to Studio', choose billing cycle, and complete payment.",
      },
      {
        name: "Cancel / Downgrade",
        location: "Bottom of the page",
        does: "Cancel your current subscription. You keep access until the end of your billing period.",
      },
    ],
  },
}

// ─── Match a route path to a page key ────────────────────────────────────────

export function matchPageKey(path: string): string | null {
  if (!path) return null
  const clean = path.toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "")

  // Exact matches first
  if (PAGE_GUIDE[clean]) return clean

  // Pattern matches
  if (clean === "" || clean === "dashboard") return "dashboard"
  if (clean === "productcatalog" || clean === "product-catalog") return "product-catalog"
  if (clean === "designer/create") return "designer-create"
  if (/^designer\/\d+/.test(clean) && clean.includes("preview")) return "designer-preview"
  if (/^designer\/\d+/.test(clean) || /^designer\/[a-z0-9]+/.test(clean)) return "designer"
  if (clean.startsWith("products/new")) return "products/new"
  if (clean.startsWith("products/") && clean !== "products") return "products/detail"
  if (clean === "products") return "products"
  if (clean.startsWith("orders/") && clean !== "orders") return "orders/detail"
  if (clean === "orders") return "orders"
  if (clean.startsWith("my-store") || clean.startsWith("mystore")) return "my-store"
  if (clean === "membership") return "membership"

  return null
}

// ─── Build the page context string for the system prompt ─────────────────────

export function buildPageContext(currentPath?: string): string {
  if (!currentPath) {
    return `
--- CURRENT PAGE ---
Unknown. If the creator says they are stuck or asks for help navigating,
ask them: "Which page are you on right now? (Dashboard, Product Catalog, Designer, Orders, My Store, or Membership?)"
Then give specific step-by-step guidance based on their answer.
`
  }

  const key = matchPageKey(currentPath)

  if (!key || !PAGE_GUIDE[key]) {
    return `
--- CURRENT PAGE ---
Creator is on: ${currentPath}
No specific guide available for this page. Ask them to describe what they're trying to do
and give general guidance based on JUNOONI platform knowledge.
`
  }

  const page = PAGE_GUIDE[key]

  const sectionsText = page.sections
    .map((s) => {
      let text = `  • ${s.name} (${s.location})\n    → ${s.does}`
      if (s.howTo) text += `\n    HOW TO: ${s.howTo}`
      return text
    })
    .join("\n\n")

  return `
--- CURRENT PAGE ---
Creator is currently on: ${page.name}
${page.description}

Sections on this page:
${sectionsText}

When the creator asks for help, first understand what they are trying to achieve,
then point them to the exact section and give step-by-step instructions.
Use the section names and locations above so your guidance is precise.
Do not dump all sections at once — ask what they're trying to do if it's unclear,
then guide them to the right section only.
`
}
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
  page_: ["featured","image_text","video_text","text","image","video","ticker","divider","html"],
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
    defaultSections: [],
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

const CONTACT_PAGE_CONTENT = `<div id="junooni-contact-wrap" style="font-family:inherit;max-width:600px;margin:0 auto;padding:8px 0">

<style>
#junooni-contact-wrap h2{font-size:1.75rem;font-weight:700;margin-bottom:8px;color:inherit}
#junooni-contact-wrap p.subtitle{color:#6b7280;margin-bottom:28px;font-size:15px}
.jcf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.jcf-grid{grid-template-columns:1fr}}
.jcf-field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
.jcf-field label{font-size:13px;font-weight:500;color:#374151}
.jcf-field input,.jcf-field select,.jcf-field textarea{
  padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;
  font-size:14px;font-family:inherit;outline:none;
  transition:border-color 0.2s,box-shadow 0.2s;background:#fff;
  box-sizing:border-box;width:100%
}
.jcf-field input:focus,.jcf-field select:focus,.jcf-field textarea:focus{
  border-color:#e65100;box-shadow:0 0 0 3px rgba(230,81,0,0.08)
}
.jcf-submit{
  background:linear-gradient(135deg,#e65100 0%,#ac1900 100%);
  color:#fff;border:none;padding:13px 36px;border-radius:50px;
  font-size:15px;font-weight:600;cursor:pointer;
  transition:opacity 0.2s,transform 0.15s;letter-spacing:0.3px;margin-top:4px
}
.jcf-submit:hover{opacity:0.9;transform:translateY(-1px)}
.jcf-submit:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.jcf-status{margin-top:16px;padding:14px 18px;border-radius:10px;font-size:14px;display:none}
.jcf-status.success{background:#ecfdf5;border:1px solid #6ee7b7;color:#065f46;display:block}
.jcf-status.error{background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;display:block}
.jcf-info{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;
  background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:24px}
.jcf-info-icon{font-size:20px;line-height:1}
.jcf-info-text{font-size:13px;color:#92400e}
.jcf-info-text a{color:#e65100;font-weight:600;text-decoration:none}
.jcf-info-text a:hover{text-decoration:underline}
</style>

<h2>Get in touch</h2>
<p class="subtitle">Have a question about your order, or need help? Fill out the form and we'll get back to you within 24 hours.</p>

<div class="jcf-info">
  <span class="jcf-info-icon">💬</span>
  <div class="jcf-info-text">
    For urgent help, email us directly at
    <a href="mailto:support@junooni.com">support@junooni.com</a>
    or WhatsApp <a href="https://wa.me/918694062222">+91 86940 62222</a>
  </div>
</div>

<form id="jcf-form" novalidate>
  <div class="jcf-grid">
    <div class="jcf-field">
      <label for="jcf-name">Your Name *</label>
      <input type="text" id="jcf-name" name="name" required placeholder="Jane Smith" autocomplete="name" />
    </div>
    <div class="jcf-field">
      <label for="jcf-email">Email Address *</label>
      <input type="email" id="jcf-email" name="email" required placeholder="jane@example.com" autocomplete="email" />
    </div>
  </div>
  <div class="jcf-grid">
    <div class="jcf-field">
      <label for="jcf-order">Order Number (optional)</label>
      <input type="text" id="jcf-order" name="orderNumber" placeholder="JUN-123456" />
    </div>
    <div class="jcf-field">
      <label for="jcf-cat">Category</label>
      <select id="jcf-cat" name="category">
        <option value="">Select a topic</option>
        <option>Orders &amp; Shipping</option>
        <option>Returns &amp; Refunds</option>
        <option>Product Information</option>
        <option>Payment &amp; Billing</option>
        <option>Technical Issues</option>
        <option>Other</option>
      </select>
    </div>
  </div>
  <div class="jcf-field">
    <label for="jcf-msg">Message *</label>
    <textarea id="jcf-msg" name="message" rows="5" required placeholder="Tell us how we can help. Include any relevant order numbers or error messages."></textarea>
  </div>
  <button type="submit" class="jcf-submit" id="jcf-btn">Send Message →</button>
  <div class="jcf-status" id="jcf-status"></div>
</form>

<script>
(function(){
  var form = document.getElementById('jcf-form');
  var btn  = document.getElementById('jcf-submit');
  var status = document.getElementById('jcf-status');
  if(!form) return;

  function getHandle(){
    var parts = window.location.pathname.replace(/^\/+|\/+$/g,'').split('/');
    var host = window.location.hostname;
    var isMarketplace = host === 'junooni.com' || host === 'localhost';
    return isMarketplace ? (parts[0] || '') : '';
  }

  var backendUrl = 'http://localhost:9000';

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    e.stopPropagation();
    status.className = 'jcf-status';
    status.textContent = '';

    var nameEl    = document.getElementById('jcf-name');
    var emailEl   = document.getElementById('jcf-email');
    var orderEl   = document.getElementById('jcf-order');
    var catEl     = document.getElementById('jcf-cat');
    var msgEl     = document.getElementById('jcf-msg');

    var name    = nameEl ? nameEl.value.trim() : '';
    var email   = emailEl ? emailEl.value.trim() : '';
    var order   = orderEl ? orderEl.value.trim() : '';
    var cat     = catEl ? catEl.value : '';
    var message = msgEl ? msgEl.value.trim() : '';

    if(!name || !email || !message){
      status.className = 'jcf-status error';
      status.textContent = '⚠️ Please fill in your name, email, and message.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';

    var handle = getHandle();
    var payload = JSON.stringify({
      name: name,
      email: email,
      orderNumber: order,
      category: cat,
      message: message,
      storeName: handle,
    });

    try {
      var endpoint = handle
        ? (backendUrl + '/storefront/' + handle + '/contact')
        : (backendUrl + '/store/chat-support');

      var res = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: payload,
      });
      var json = await res.json();
      if(res.ok && json.success){
        status.className = 'jcf-status success';
        status.textContent = '✅ Message sent! We\'ll reply within 24-48 hours. Check your inbox for confirmation.';
        form.reset();
      } else {
        throw new Error(json.error || 'Failed to send');
      }
    } catch(err){
      status.className = 'jcf-status error';
      status.innerHTML = '❌ ' + (err.message || 'Something went wrong.') + ' Email us at <a href="mailto:support@junooni.com" style="color:#991b1b;font-weight:600">support@junooni.com</a>';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    }
  });
})();
</script>
</div>`

export const PAGE_TEMPLATES = [
  { id: "blank"   as PageTemplate, label: "Blank",             icon: "📄", defaultContent: "" },
  { id: "about"   as PageTemplate, label: "About Me",          icon: "📄", defaultContent: "## About Me\n\nShare your story here..." },
  { id: "faq"     as PageTemplate, label: "FAQ",               icon: "📄", defaultContent: "## Frequently Asked Questions\n\n**Q: How long does shipping take?**\nA: 5-7 business days.\n\n**Q: Do you ship internationally?**\nA: Yes!" },
  { id: "contact" as PageTemplate, label: "Contact",           icon: "📄", defaultContent: CONTACT_PAGE_CONTENT },
  { id: "links"   as PageTemplate, label: "Links",             icon: "🔗", defaultContent: "" },
  { id: "terms"   as PageTemplate, label: "Terms of Service",  icon: "📄", defaultContent: `## Terms of Service\n\n*Last updated: {{CREATED_DATE}}*\n\nWelcome to **[Your Store Name]**. By accessing or purchasing from our store, you agree to the following terms.\n\n### 1. General\nThese Terms of Service apply to all visitors, users, and customers of [Your Store Name] ("we", "us", or "our").\n\n### 2. Products\nAll products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice.\n\n### 3. Orders & Payment\nBy placing an order, you confirm that the information you provide is accurate. We accept payment via the methods listed at checkout. Orders are processed only after payment is confirmed.\n\n### 4. Shipping\nWe ship pan-India. Estimated delivery is 5–10 business days. We are not responsible for delays caused by shipping carriers or customs.\n\n### 5. Returns & Refunds\nPlease refer to our [Returns & Refunds Policy](/pages/returns-refunds) for details.\n\n### 6. Intellectual Property\nAll content on this store — including logos, designs, and product images — is the property of [Your Store Name] and may not be reproduced without written permission.\n\n### 7. Limitation of Liability\nWe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our store or products.\n\n### 8. Contact\nFor any questions, reach us at **[your@email.com]**` },
  { id: "privacy" as PageTemplate, label: "Privacy Policy",    icon: "📄", defaultContent: `## Privacy Policy\n\n*Last updated: {{CREATED_DATE}}*\n\nAt **[Your Store Name]**, your privacy is important to us.\n\n### 1. Information We Collect\n- **Personal information:** Name, email address, shipping address, and phone number when you place an order.\n- **Payment information:** We do not store card details. Payments are processed securely by our payment partner.\n- **Usage data:** Pages visited, browser type, and device information.\n\n### 2. How We Use Your Information\n- To process and fulfil your orders\n- To send order confirmations and shipping updates\n- To respond to customer service queries\n\n### 3. Data Sharing\nWe do not sell your personal information.\n\n### 4. Cookies\nOur store uses cookies to keep your cart and remember preferences.\n\n### 5. Contact\nQuestions? Write to us at **[your@email.com]**` },
  { id: "returns" as PageTemplate, label: "Returns & Refunds", icon: "📄", defaultContent: `## Returns & Refunds Policy\n\n*Last updated: {{CREATED_DATE}}*\n\n### Eligibility for Returns\n- Items must be returned within **7 days** of delivery.\n- Products must be unused, unwashed, and in original packaging.\n\n### How to Initiate a Return\n1. Email us at **[your@email.com]** with your order number.\n2. Our team will respond within 48 hours with return instructions.\n\n### Refunds\nApproved refunds are processed within **5–7 business days**.\n\n### Contact\nFor any queries, reach us at **[your@email.com]**` },
]

export const BUILTIN_PAGES = [
  { label: "Home",         url: "/" },
  { label: "All Products", url: "/products" },
  { label: "Collections",  url: "/collections" },
  { label: "Categories",   url: "/categories" },
  { label: "Search",       url: "/search" },
  { label: "Checkout",     url: "/checkout" },
]
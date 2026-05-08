// import { model } from "@medusajs/framework/utils"
// import Vendor from "./vendor"

// const VendorStore = model.define("vendor_store", {
//   id: model.id().primaryKey(),

//   // ── Identity ──────────────────────────────────────────────────────────────
//   subdomain: model.text().unique().nullable(),
//   custom_domain: model.text().nullable(),
//   domain_verified: model.boolean().default(false),

//   // ── Template & status ─────────────────────────────────────────────────────
//   template: model.enum(["minimal", "bold", "editorial"]).default("minimal"),
//   status: model.enum(["draft", "live", "paused"]).default("draft"),

//   // ── Password protection ───────────────────────────────────────────────────
//   password_enabled: model.boolean().default(false),
//   store_password: model.text().nullable(),   // bcrypt hash — never plaintext

//   // ── Branding ──────────────────────────────────────────────────────────────
//   primary_color: model.text().default("#000000").nullable(),
//   secondary_color: model.text().default("#ffffff").nullable(),
//   font: model.text().default("inter").nullable(),
//   hero_image: model.text().nullable(),
//   tagline: model.text().nullable(),
//   announcement_text: model.text().nullable(),

//   // ── Store logo & favicon ──────────────────────────────────────────────────
//   store_logo: model.text().nullable(),
//   store_favicon: model.text().nullable(),

//   // ── Page sections (JSON) ──────────────────────────────────────────────────
//   sections: model.json().nullable(),

//   // ── Custom pages (JSON) ───────────────────────────────────────────────────
//   pages: model.json().nullable(),

//   // ── Creator collections (JSON) ────────────────────────────────────────────
//   collections: model.json().nullable(),

//   // ── Product detail settings (JSON) ───────────────────────────────────────
//   product_detail: model.json().nullable(),      // ← ADD

//   // ── Style ─────────────────────────────────────────────────────────────────
//   border_radius: model.text().nullable(),        // ← ADD
//   button_style: model.text().nullable(),         // ← ADD
//   product_card: model.json().nullable(),         // ← ADD
//   accent_color: model.text().nullable(),         // ← ADD
//   custom_css: model.text().nullable(),           // ← ADD
//   og_image: model.text().nullable(),             // ← ADD

//   // ── Social ────────────────────────────────────────────────────────────────
//   instagram_url: model.text().nullable(),        // ← ADD
//   youtube_url: model.text().nullable(),          // ← ADD
//   twitter_url: model.text().nullable(),          // ← ADD
//   facebook_url: model.text().nullable(),         // ← ADD
//   tiktok_url: model.text().nullable(),           // ← ADD
//   discord_url: model.text().nullable(),          // ← ADD

//   // ── SEO ───────────────────────────────────────────────────────────────────
//   seo_title: model.text().nullable(),
//   seo_description: model.text().nullable(),

//   // ── Header behaviour ──────────────────────────────────────────────────────
//   sticky_header: model.boolean().default(true).nullable(),
//   sticky_announcement: model.boolean().default(true).nullable(),

//   // ── Relation ──────────────────────────────────────────────────────────────
//   vendor: model.belongsTo(() => Vendor, { mappedBy: "vendor_store" }),
// })

// export default VendorStore


import { model } from "@medusajs/framework/utils"
import Vendor from "./vendor"

const VendorStore = model.define("vendor_store", {
  id: model.id().primaryKey(),

  // ── Identity ──────────────────────────────────────────────────────────────
  subdomain: model.text().unique().nullable(),
  custom_domain: model.text().nullable(),
  domain_verified: model.boolean().default(false),

  // ── Template & status ─────────────────────────────────────────────────────
  template: model.enum(["minimal", "bold", "editorial"]).default("minimal"),
  status: model.enum(["draft", "live", "paused"]).default("draft"),

  // ── Password protection ───────────────────────────────────────────────────
  password_enabled: model.boolean().default(false),
  store_password: model.text().nullable(),

  // ── Branding (kept as columns — frequently read) ──────────────────────────
  primary_color: model.text().default("#000000").nullable(),
  secondary_color: model.text().default("#ffffff").nullable(),
  font: model.text().default("inter").nullable(),
  store_logo: model.text().nullable(),
  store_favicon: model.text().nullable(),

  // ── Content (JSON) ────────────────────────────────────────────────────────
  sections: model.json().nullable(),
  pages: model.json().nullable(),
  collections: model.json().nullable(),

  // ── SEO (kept as columns — used in metadata generation) ───────────────────
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),

  // ── All other settings in one JSON field ──────────────────────────────────
  // Holds: accent_color, border_radius, button_style, product_card,
  //        product_detail, custom_css, og_image, hero_image, tagline,
  //        announcement_text, sticky_header, sticky_announcement,
  //        instagram_url, youtube_url, twitter_url, facebook_url,
  //        tiktok_url, discord_url
  settings: model.json().nullable(),

  // ── Relation ──────────────────────────────────────────────────────────────
  vendor: model.belongsTo(() => Vendor, { mappedBy: "vendor_store" }),
})

export default VendorStore
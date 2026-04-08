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

  // ── Branding ──────────────────────────────────────────────────────────────
  primary_color: model.text().default("#000000").nullable(),
  secondary_color: model.text().default("#ffffff").nullable(),
  font: model.text().default("inter").nullable(),
  hero_image: model.text().nullable(),
  tagline: model.text().nullable(),
  announcement_text: model.text().nullable(),

  // ── Store logo & favicon ──────────────────────────────────────────────────
  store_logo: model.text().nullable(),
  store_favicon: model.text().nullable(),

  // ── Page sections (JSON) ──────────────────────────────────────────────────
  sections: model.json().nullable(),

  // ── Custom pages (JSON) ───────────────────────────────────────────────────
  pages: model.json().nullable(),

  // ── Creator collections (JSON) ────────────────────────────────────────────
  // Stored as { collections: VendorCollection[] }
  // Each collection has its own product_ids list (Medusa product IDs)
  collections: model.json().nullable(),

  // ── SEO ───────────────────────────────────────────────────────────────────
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),

  // ── Header behaviour ──────────────────────────────────────────────────────
  sticky_header: model.boolean().default(true).nullable(),
  sticky_announcement: model.boolean().default(true).nullable(),

  // ── Relation ──────────────────────────────────────────────────────────────
  vendor: model.belongsTo(() => Vendor, { mappedBy: "vendor_store" }),
})

export default VendorStore